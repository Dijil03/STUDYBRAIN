import { Server } from 'socket.io';

export const setupDocumentSocket = (server) => {
    const allowedSocketOrigins = process.env.NODE_ENV === 'production'
        ? [
            process.env.FRONTEND_URL,
            process.env.CLIENT_URL,
            'https://studybrain.vercel.app',
            'https://www.studybrain.vercel.app'
          ].filter(Boolean)
        : ["http://localhost:5173"];
    
    const io = new Server(server, {
        cors: {
            origin: allowedSocketOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Store active users in each document room
    const documentUsers = new Map();
    const whiteboardUsers = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join document room
        socket.on('join-document', (data) => {
            const { documentId, userId, username } = data;
            const roomName = `document-${documentId}`;

            socket.join(roomName);

            // Add user to document users map
            if (!documentUsers.has(documentId)) {
                documentUsers.set(documentId, new Map());
            }

            documentUsers.get(documentId).set(socket.id, {
                userId,
                username,
                cursor: null,
                selection: null
            });

            // Notify others in the room about new user
            socket.to(roomName).emit('user-joined', {
                userId,
                username,
                socketId: socket.id
            });

            // Send current users in the room to the new user
            const currentUsers = Array.from(documentUsers.get(documentId).values());
            socket.emit('users-in-room', currentUsers);

            console.log(`User ${username} joined document ${documentId}`);
        });

        // Handle cursor position updates
        socket.on('cursor-update', (data) => {
            const { documentId, cursor, selection } = data;
            const roomName = `document-${documentId}`;

            // Update user's cursor position
            if (documentUsers.has(documentId)) {
                const user = documentUsers.get(documentId).get(socket.id);
                if (user) {
                    user.cursor = cursor;
                    user.selection = selection;
                }
            }

            // Broadcast cursor position to other users in the room
            socket.to(roomName).emit('cursor-update', {
                socketId: socket.id,
                cursor,
                selection
            });
        });

        // Handle content changes
        socket.on('content-change', (data) => {
            const { documentId, content, userId } = data;
            const roomName = `document-${documentId}`;

            // Broadcast content change to other users in the room
            socket.to(roomName).emit('content-change', {
                content,
                userId,
                timestamp: Date.now()
            });
        });

        // Handle typing indicators
        socket.on('typing-start', (data) => {
            const { documentId, userId, username } = data;
            const roomName = `document-${documentId}`;

            socket.to(roomName).emit('typing-start', {
                userId,
                username
            });
        });

        socket.on('typing-stop', (data) => {
            const { documentId, userId } = data;
            const roomName = `document-${documentId}`;

            socket.to(roomName).emit('typing-stop', {
                userId
            });
        });

        // Handle comments
        socket.on('comment-added', (data) => {
            const { documentId, comment } = data;
            const roomName = `document-${documentId}`;

            socket.to(roomName).emit('comment-added', comment);
        });

        socket.on('comment-resolved', (data) => {
            const { documentId, commentId, resolved } = data;
            const roomName = `document-${documentId}`;

            socket.to(roomName).emit('comment-resolved', {
                commentId,
                resolved
            });
        });

        // Handle presence updates
        socket.on('presence-update', (data) => {
            const { documentId, isActive } = data;
            const roomName = `document-${documentId}`;

            if (documentUsers.has(documentId)) {
                const user = documentUsers.get(documentId).get(socket.id);
                if (user) {
                    user.isActive = isActive;
                }
            }

            socket.to(roomName).emit('presence-update', {
                socketId: socket.id,
                isActive
            });
        });

        // Whiteboard: join room
        socket.on('join-whiteboard', (data = {}) => {
            const { whiteboardId, userId, username, color } = data;
            if (!whiteboardId) return;

            const roomName = `whiteboard-${whiteboardId}`;
            socket.join(roomName);

            if (!whiteboardUsers.has(whiteboardId)) {
                whiteboardUsers.set(whiteboardId, new Map());
            }

            whiteboardUsers.get(whiteboardId).set(socket.id, {
                userId,
                username,
                color,
            });

            socket.emit('whiteboard-users', Array.from(whiteboardUsers.get(whiteboardId).values()));
            socket.to(roomName).emit('whiteboard-user-joined', {
                userId,
                username,
                color,
                socketId: socket.id,
            });
        });

        socket.on('leave-whiteboard', (data = {}) => {
            const { whiteboardId } = data;
            if (!whiteboardId || !whiteboardUsers.has(whiteboardId)) return;

            const roomName = `whiteboard-${whiteboardId}`;
            const users = whiteboardUsers.get(whiteboardId);
            const user = users.get(socket.id);

            users.delete(socket.id);
            socket.leave(roomName);

            if (user) {
                socket.to(roomName).emit('whiteboard-user-left', {
                    userId: user.userId,
                    username: user.username,
                    socketId: socket.id,
                });
            }

            if (users.size === 0) {
                whiteboardUsers.delete(whiteboardId);
            }
        });

        socket.on('whiteboard-sync', (data = {}) => {
            const { whiteboardId, paths, meta } = data;
            if (!whiteboardId) return;
            const roomName = `whiteboard-${whiteboardId}`;
            socket.to(roomName).emit('whiteboard-sync', {
                whiteboardId,
                paths,
                meta,
                timestamp: Date.now(),
            });
        });

        socket.on('whiteboard-clear', (data = {}) => {
            const { whiteboardId } = data;
            if (!whiteboardId) return;
            const roomName = `whiteboard-${whiteboardId}`;
            socket.to(roomName).emit('whiteboard-clear', { whiteboardId });
        });

        socket.on('whiteboard-tool-update', (data = {}) => {
            const { whiteboardId, tool, color, strokeWidth, userId } = data;
            if (!whiteboardId) return;
            const roomName = `whiteboard-${whiteboardId}`;
            socket.to(roomName).emit('whiteboard-tool-update', {
                whiteboardId,
                tool,
                color,
                strokeWidth,
                userId,
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            // Find and remove user from all document rooms
            for (const [documentId, users] of documentUsers.entries()) {
                if (users.has(socket.id)) {
                    const user = users.get(socket.id);
                    users.delete(socket.id);

                    // Notify others in the room
                    const roomName = `document-${documentId}`;
                    socket.to(roomName).emit('user-left', {
                        userId: user.userId,
                        username: user.username,
                        socketId: socket.id
                    });

                    // Clean up empty document rooms
                    if (users.size === 0) {
                        documentUsers.delete(documentId);
                    }
                }
            }

            // Remove user from any whiteboard rooms
            for (const [whiteboardId, users] of whiteboardUsers.entries()) {
                if (users.has(socket.id)) {
                    const user = users.get(socket.id);
                    users.delete(socket.id);

                    const roomName = `whiteboard-${whiteboardId}`;
                    socket.to(roomName).emit('whiteboard-user-left', {
                        userId: user.userId,
                        username: user.username,
                        socketId: socket.id,
                    });

                    if (users.size === 0) {
                        whiteboardUsers.delete(whiteboardId);
                    }
                }
            }
        });
    });

    return io;
};

