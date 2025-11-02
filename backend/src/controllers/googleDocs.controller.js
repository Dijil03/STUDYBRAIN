import User from '../models/auth.model.js';

// Helper function to get valid access token
const getValidAccessToken = async (user) => {
    console.log('🔍 getValidAccessToken called with user:', user ? `User ID: ${user._id || user.id}` : 'No user');

    if (!user) {
        throw new Error('User not provided to getValidAccessToken');
    }

    // Check if user has Google access token
    if (!user.googleAccessToken) {
        console.error('❌ User does not have googleAccessToken');
        throw new Error('User not connected to Google. Please authorize Google Docs access.');
    }

    // Check if token is expired and refresh if needed
    const isExpired = user.googleTokenExpiry && new Date() > new Date(user.googleTokenExpiry);
    
    if (isExpired) {
        console.log('🔄 Token expired, attempting refresh...');
        
        if (!user.googleRefreshToken) {
            console.error('❌ No refresh token available');
            throw new Error('Google refresh token not found. Please re-authorize Google Docs access.');
        }

        try {
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    refresh_token: user.googleRefreshToken,
                    grant_type: 'refresh_token'
                })
            });

            if (!refreshResponse.ok) {
                const errorText = await refreshResponse.text();
                console.error('❌ Token refresh failed:', refreshResponse.status, errorText);
                throw new Error(`Failed to refresh token: ${refreshResponse.status}`);
            }

            const tokenData = await refreshResponse.json();

            if (!tokenData.access_token) {
                console.error('❌ No access token in refresh response');
                throw new Error('Token refresh response missing access_token');
            }

            // Update user with new tokens
            user.googleAccessToken = tokenData.access_token;
            user.googleTokenExpiry = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);
            await user.save();

            console.log('✅ Google access token refreshed for user:', user.id || user._id);
            return tokenData.access_token;
        } catch (error) {
            console.error('❌ Error refreshing Google token:', error.message);
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    console.log('✅ Using existing access token');
    return user.googleAccessToken;
};

// Google Docs API integration controller
export const googleDocsController = {

    // Test endpoint to check if Google Docs integration is working
    async testConnection(req, res) {
        try {
            res.json({
                success: true,
                message: 'Google Docs integration is working',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error testing Google Docs connection:', error);
            res.status(500).json({ error: 'Failed to test connection' });
        }
    },

    // Get Google Docs access token for user
    async getAccessToken(req, res) {
        try {
            const { userId } = req.params;
            console.log('🔍 getAccessToken called for userId:', userId);

            // Find user and get their Google OAuth tokens
            const user = await User.findById(userId);
            console.log('🔍 User found:', user ? 'Yes' : 'No');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if user has Google OAuth tokens
            if (!user.googleAccessToken) {
                return res.status(400).json({
                    error: 'User not connected to Google',
                    needsAuth: true,
                    message: 'Please connect your Google account first'
                });
            }

            // Get valid access token (refresh if needed)
            const accessToken = await getValidAccessToken(user);

            // Return the access token
            res.json({
                success: true,
                accessToken: accessToken,
                refreshToken: user.googleRefreshToken,
                expiresAt: user.googleTokenExpiry
            });

        } catch (error) {
            console.error('Error getting Google access token:', error);
            if (error.message === 'Token refresh failed') {
                return res.status(401).json({
                    error: 'Google token expired and refresh failed',
                    needsAuth: true
                });
            }
            res.status(500).json({ error: 'Failed to get access token' });
        }
    },

    // Create a new Google Doc
    async createDocument(req, res) {
        try {
            const { userId } = req.params;
            const { title, content = '' } = req.body;
            console.log('🔍 createDocument called for userId:', userId, 'title:', title);

            // Find user
            const user = await User.findById(userId);
            console.log('🔍 User found:', user ? 'Yes' : 'No');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!user.googleAccessToken) {
                return res.status(400).json({
                    error: 'User not connected to Google',
                    needsAuth: true
                });
            }

            // Get valid access token
            const accessToken = await getValidAccessToken(user);

            // Use Google Docs API to create document
            const response = await fetch('https://docs.googleapis.com/v1/documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Google API error: ${errorData.error?.message || response.statusText}`);
            }

            const document = await response.json();

            // If content is provided, update the document
            if (content) {
                const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${document.documentId}:batchUpdate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        requests: [{
                            insertText: {
                                location: { index: 1 },
                                text: content
                            }
                        }]
                    })
                });

                if (!updateResponse.ok) {
                    console.warn('Document created but content update failed');
                }
            }

            res.json({
                success: true,
                document: {
                    id: document.documentId,
                    title: document.title,
                    webViewLink: `https://docs.google.com/document/d/${document.documentId}/edit`,
                    createdTime: document.createdTime,
                    modifiedTime: document.modifiedTime
                }
            });

        } catch (error) {
            console.error('Error creating Google document:', error);
            if (error.message === 'Token refresh failed') {
                return res.status(401).json({
                    error: 'Google token expired and refresh failed',
                    needsAuth: true
                });
            }
            res.status(500).json({ error: 'Failed to create document' });
        }
    },

    // List user's Google Docs
    async listDocuments(req, res) {
        try {
            const { userId } = req.params;
            console.log('📋 listDocuments called for userId:', userId);

            // Find user
            const user = await User.findById(userId);
            if (!user) {
                console.error('❌ User not found:', userId);
                return res.status(404).json({ 
                    success: false,
                    error: 'User not found' 
                });
            }

            console.log('✅ User found:', user.email);

            // Check if user has Google tokens
            if (!user.googleAccessToken) {
                console.warn('⚠️ User does not have Google access token');
                return res.status(400).json({
                    success: false,
                    error: 'User not connected to Google',
                    needsAuth: true,
                    authUrl: `/api/auth/google-docs?userId=${userId}`
                });
            }

            // Get valid access token
            let accessToken;
            try {
                accessToken = await getValidAccessToken(user);
            } catch (tokenError) {
                console.error('❌ getValidAccessToken failed:', tokenError.message);
                return res.status(401).json({
                    success: false,
                    error: tokenError.message || 'Failed to get access token',
                    needsAuth: true,
                    authUrl: `/api/auth/google-docs?userId=${userId}`
                });
            }

            // Use Google Drive API to list documents
            const driveApiUrl = 'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.document"&fields=files(id,name,createdTime,modifiedTime,webViewLink)';
            console.log('📡 Calling Google Drive API...');
            
            const response = await fetch(driveApiUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                
                console.error('❌ Google Drive API error:', response.status, errorData);
                
                if (response.status === 401 || response.status === 403) {
                    return res.status(401).json({
                        success: false,
                        error: 'Google API authentication failed. Please re-authorize.',
                        needsAuth: true,
                        authUrl: `/api/auth/google-docs?userId=${userId}`,
                        details: errorData.error?.message || errorData.message
                    });
                }
                
                throw new Error(`Google API error: ${errorData.error?.message || errorData.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Google Drive API response:', data.files?.length || 0, 'documents found');

            res.json({
                success: true,
                documents: (data.files || []).map(file => ({
                    id: file.id,
                    name: file.name,
                    webViewLink: file.webViewLink,
                    createdTime: file.createdTime,
                    modifiedTime: file.modifiedTime
                }))
            });

        } catch (error) {
            console.error('❌ Error listing Google documents:', error);
            console.error('Error stack:', error.stack);
            
            // Return more descriptive error messages
            if (error.message.includes('Token refresh failed') || error.message.includes('not connected')) {
                return res.status(401).json({
                    success: false,
                    error: error.message || 'Google authentication failed',
                    needsAuth: true,
                    authUrl: `/api/auth/google-docs?userId=${req.params.userId}`
                });
            }
            
            res.status(500).json({ 
                success: false,
                error: error.message || 'Failed to list documents',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    // Get document content
    async getDocument(req, res) {
        try {
            const { userId, documentId } = req.params;

            // Find user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!user.googleAccessToken) {
                return res.status(400).json({
                    error: 'User not connected to Google',
                    needsAuth: true
                });
            }

            // Get valid access token
            const accessToken = await getValidAccessToken(user);

            // Get document content
            const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Google API error: ${errorData.error?.message || response.statusText}`);
            }

            const document = await response.json();

            res.json({
                success: true,
                document: {
                    id: document.documentId,
                    title: document.title,
                    content: document.body?.content || '',
                    webViewLink: `https://docs.google.com/document/d/${document.documentId}/edit`
                }
            });

        } catch (error) {
            console.error('Error getting Google document:', error);
            if (error.message === 'Token refresh failed') {
                return res.status(401).json({
                    error: 'Google token expired and refresh failed',
                    needsAuth: true
                });
            }
            res.status(500).json({ error: 'Failed to get document' });
        }
    },

    // Share document
    async shareDocument(req, res) {
        try {
            const { userId, documentId } = req.params;
            const { email, role = 'reader' } = req.body;

            // Find user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!user.googleAccessToken) {
                return res.status(400).json({
                    error: 'User not connected to Google',
                    needsAuth: true
                });
            }

            // Get valid access token
            const accessToken = await getValidAccessToken(user);

            // Share document via Google Drive API
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}/permissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: role,
                    type: 'user',
                    emailAddress: email
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Google API error: ${errorData.error?.message || response.statusText}`);
            }

            res.json({
                success: true,
                message: `Document shared with ${email}`
            });

        } catch (error) {
            console.error('Error sharing Google document:', error);
            if (error.message === 'Token refresh failed') {
                return res.status(401).json({
                    error: 'Google token expired and refresh failed',
                    needsAuth: true
                });
            }
            res.status(500).json({ error: 'Failed to share document' });
        }
    }
};
