import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VirtualCampus from '../models/virtualCampus.model.js';
import connectDB from '../db/connection.js';

// Load environment variables
dotenv.config();

const campusLocations = [
    {
        id: 'entrance',
        name: 'Main Entrance',
        description: 'Welcome to the Virtual Learning Campus! Start your journey here.',
        type: 'entrance',
        position: { x: 0, y: 0, z: 0 },
        size: { width: 20, height: 10, depth: 20 },
        appearance: {
            color: '#4A90E2',
            texture: 'marble',
            lighting: 'bright'
        },
        interactiveElements: [
            {
                id: 'welcome_sign',
                type: 'decoration',
                position: { x: 0, y: 2, z: 10 },
                action: 'show_welcome_message',
                description: 'Welcome to the campus!'
            }
        ],
        capacity: 100,
        accessLevel: 'public',
        activities: [
            {
                id: 'campus_tour',
                name: 'Campus Tour',
                description: 'Take a guided tour of the virtual campus',
                type: 'social',
                xpReward: 25,
                coinReward: 10,
                duration: 5
            }
        ]
    },
    {
        id: 'library',
        name: 'Digital Library',
        description: 'A quiet place for focused studying and research.',
        type: 'library',
        position: { x: -50, y: 0, z: 0 },
        size: { width: 30, height: 8, depth: 25 },
        appearance: {
            color: '#8B4513',
            texture: 'wood',
            lighting: 'warm'
        },
        interactiveElements: [
            {
                id: 'study_booth_1',
                type: 'study_spot',
                position: { x: -40, y: 1, z: 5 },
                action: 'start_study_session',
                description: 'Quiet study booth'
            },
            {
                id: 'study_booth_2',
                type: 'study_spot',
                position: { x: -30, y: 1, z: 5 },
                action: 'start_study_session',
                description: 'Quiet study booth'
            },
            {
                id: 'book_shelf_1',
                type: 'book_shelf',
                position: { x: -45, y: 2, z: 10 },
                action: 'browse_books',
                description: 'Mathematics books'
            },
            {
                id: 'book_shelf_2',
                type: 'book_shelf',
                position: { x: -35, y: 2, z: 10 },
                action: 'browse_books',
                description: 'Science books'
            }
        ],
        capacity: 30,
        accessLevel: 'public',
        activities: [
            {
                id: 'focused_study',
                name: 'Focused Study',
                description: 'Study in a quiet environment with bonus XP',
                type: 'study',
                xpReward: 50,
                coinReward: 15,
                duration: 30
            },
            {
                id: 'research_project',
                name: 'Research Project',
                description: 'Conduct research using the library resources',
                type: 'study',
                xpReward: 100,
                coinReward: 25,
                duration: 60
            }
        ]
    },
    {
        id: 'math_classroom',
        name: 'Mathematics Classroom',
        description: 'Interactive classroom for mathematics learning.',
        type: 'classroom',
        position: { x: 50, y: 0, z: 0 },
        size: { width: 25, height: 8, depth: 20 },
        appearance: {
            color: '#2E8B57',
            texture: 'modern',
            lighting: 'bright'
        },
        interactiveElements: [
            {
                id: 'whiteboard',
                type: 'whiteboard',
                position: { x: 45, y: 3, z: 5 },
                action: 'solve_math_problems',
                description: 'Interactive whiteboard for math problems'
            },
            {
                id: 'student_desk_1',
                type: 'study_spot',
                position: { x: 40, y: 1, z: 8 },
                action: 'attend_class',
                description: 'Student desk'
            },
            {
                id: 'student_desk_2',
                type: 'study_spot',
                position: { x: 50, y: 1, z: 8 },
                action: 'attend_class',
                description: 'Student desk'
            },
            {
                id: 'math_computer',
                type: 'computer',
                position: { x: 55, y: 1, z: 12 },
                action: 'use_math_software',
                description: 'Computer with math software'
            }
        ],
        capacity: 25,
        accessLevel: 'public',
        activities: [
            {
                id: 'math_lesson',
                name: 'Math Lesson',
                description: 'Attend an interactive mathematics lesson',
                type: 'study',
                xpReward: 75,
                coinReward: 20,
                duration: 45,
                requirements: {
                    level: 1,
                    skills: { mathematics: 1 }
                }
            },
            {
                id: 'problem_solving',
                name: 'Problem Solving',
                description: 'Solve challenging math problems',
                type: 'study',
                xpReward: 100,
                coinReward: 25,
                duration: 30,
                requirements: {
                    level: 3,
                    skills: { mathematics: 3 }
                }
            }
        ]
    },
    {
        id: 'science_lab',
        name: 'Science Laboratory',
        description: 'Virtual laboratory for conducting experiments.',
        type: 'lab',
        position: { x: 0, y: 0, z: 50 },
        size: { width: 30, height: 10, depth: 25 },
        appearance: {
            color: '#FFD700',
            texture: 'metal',
            lighting: 'bright'
        },
        interactiveElements: [
            {
                id: 'lab_bench_1',
                type: 'study_spot',
                position: { x: -10, y: 1, z: 45 },
                action: 'conduct_experiment',
                description: 'Laboratory bench for experiments'
            },
            {
                id: 'lab_bench_2',
                type: 'study_spot',
                position: { x: 10, y: 1, z: 45 },
                action: 'conduct_experiment',
                description: 'Laboratory bench for experiments'
            },
            {
                id: 'microscope',
                type: 'computer',
                position: { x: 0, y: 1, z: 50 },
                action: 'use_microscope',
                description: 'Digital microscope'
            },
            {
                id: 'periodic_table',
                type: 'decoration',
                position: { x: 15, y: 3, z: 55 },
                action: 'view_periodic_table',
                description: 'Interactive periodic table'
            }
        ],
        capacity: 20,
        accessLevel: 'level_required',
        requiredLevel: 5,
        activities: [
            {
                id: 'chemistry_experiment',
                name: 'Chemistry Experiment',
                description: 'Conduct virtual chemistry experiments',
                type: 'study',
                xpReward: 100,
                coinReward: 30,
                duration: 45,
                requirements: {
                    level: 5,
                    skills: { science: 5 }
                }
            },
            {
                id: 'physics_simulation',
                name: 'Physics Simulation',
                description: 'Run physics simulations and experiments',
                type: 'study',
                xpReward: 120,
                coinReward: 35,
                duration: 60,
                requirements: {
                    level: 7,
                    skills: { science: 7 }
                }
            }
        ]
    },
    {
        id: 'art_studio',
        name: 'Creative Art Studio',
        description: 'Express your creativity in this inspiring space.',
        type: 'art_studio',
        position: { x: -50, y: 0, z: 50 },
        size: { width: 25, height: 8, depth: 20 },
        appearance: {
            color: '#FF69B4',
            texture: 'canvas',
            lighting: 'warm'
        },
        interactiveElements: [
            {
                id: 'easel_1',
                type: 'computer',
                position: { x: -40, y: 1, z: 45 },
                action: 'paint',
                description: 'Digital easel for painting'
            },
            {
                id: 'easel_2',
                type: 'computer',
                position: { x: -30, y: 1, z: 45 },
                action: 'paint',
                description: 'Digital easel for painting'
            },
            {
                id: 'sculpture_station',
                type: 'computer',
                position: { x: -35, y: 1, z: 50 },
                action: 'sculpt',
                description: '3D sculpture station'
            },
            {
                id: 'music_corner',
                type: 'computer',
                position: { x: -45, y: 1, z: 55 },
                action: 'compose_music',
                description: 'Digital music composition station'
            }
        ],
        capacity: 15,
        accessLevel: 'public',
        activities: [
            {
                id: 'digital_painting',
                name: 'Digital Painting',
                description: 'Create digital artwork',
                type: 'creative',
                xpReward: 60,
                coinReward: 20,
                duration: 30
            },
            {
                id: 'music_composition',
                name: 'Music Composition',
                description: 'Compose original music',
                type: 'creative',
                xpReward: 80,
                coinReward: 25,
                duration: 45
            },
            {
                id: '3d_sculpting',
                name: '3D Sculpting',
                description: 'Create 3D digital sculptures',
                type: 'creative',
                xpReward: 100,
                coinReward: 30,
                duration: 60
            }
        ]
    },
    {
        id: 'cafeteria',
        name: 'Student Cafeteria',
        description: 'Social hub for meeting friends and relaxing.',
        type: 'cafeteria',
        position: { x: 0, y: 0, z: -50 },
        size: { width: 35, height: 8, depth: 30 },
        appearance: {
            color: '#FFA500',
            texture: 'wood',
            lighting: 'warm'
        },
        interactiveElements: [
            {
                id: 'food_counter',
                type: 'decoration',
                position: { x: -10, y: 1, z: -45 },
                action: 'get_virtual_food',
                description: 'Virtual food counter'
            },
            {
                id: 'social_table_1',
                type: 'study_spot',
                position: { x: -15, y: 1, z: -40 },
                action: 'socialize',
                description: 'Social table for group discussions'
            },
            {
                id: 'social_table_2',
                type: 'study_spot',
                position: { x: 15, y: 1, z: -40 },
                action: 'socialize',
                description: 'Social table for group discussions'
            },
            {
                id: 'coffee_machine',
                type: 'computer',
                position: { x: 10, y: 1, z: -45 },
                action: 'get_coffee',
                description: 'Virtual coffee machine'
            }
        ],
        capacity: 40,
        accessLevel: 'public',
        activities: [
            {
                id: 'social_meeting',
                name: 'Social Meeting',
                description: 'Meet and chat with other students',
                type: 'social',
                xpReward: 30,
                coinReward: 10,
                duration: 15
            },
            {
                id: 'group_study',
                name: 'Group Study',
                description: 'Study together with friends',
                type: 'study',
                xpReward: 40,
                coinReward: 15,
                duration: 30
            }
        ]
    },
    {
        id: 'garden',
        name: 'Peaceful Garden',
        description: 'A serene outdoor space for relaxation and reflection.',
        type: 'garden',
        position: { x: 50, y: 0, z: -50 },
        size: { width: 40, height: 6, depth: 35 },
        appearance: {
            color: '#32CD32',
            texture: 'grass',
            lighting: 'bright'
        },
        interactiveElements: [
            {
                id: 'meditation_spot',
                type: 'study_spot',
                position: { x: 40, y: 1, z: -40 },
                action: 'meditate',
                description: 'Peaceful meditation spot'
            },
            {
                id: 'reading_bench',
                type: 'study_spot',
                position: { x: 60, y: 1, z: -45 },
                action: 'read_books',
                description: 'Comfortable reading bench'
            },
            {
                id: 'flower_garden',
                type: 'decoration',
                position: { x: 45, y: 1, z: -35 },
                action: 'tend_garden',
                description: 'Virtual flower garden'
            }
        ],
        capacity: 25,
        accessLevel: 'public',
        activities: [
            {
                id: 'meditation',
                name: 'Meditation',
                description: 'Practice mindfulness and relaxation',
                type: 'relaxation',
                xpReward: 20,
                coinReward: 5,
                duration: 10
            },
            {
                id: 'nature_reading',
                name: 'Nature Reading',
                description: 'Read books in a peaceful environment',
                type: 'study',
                xpReward: 35,
                coinReward: 12,
                duration: 25
            }
        ]
    },
    {
        id: 'gym',
        name: 'Virtual Gym',
        description: 'Stay active with virtual fitness activities.',
        type: 'gym',
        position: { x: -50, y: 0, z: -50 },
        size: { width: 30, height: 10, depth: 25 },
        appearance: {
            color: '#DC143C',
            texture: 'rubber',
            lighting: 'bright'
        },
        interactiveElements: [
            {
                id: 'treadmill',
                type: 'computer',
                position: { x: -40, y: 1, z: -45 },
                action: 'run',
                description: 'Virtual treadmill'
            },
            {
                id: 'weights',
                type: 'computer',
                position: { x: -30, y: 1, z: -40 },
                action: 'lift_weights',
                description: 'Virtual weight training'
            },
            {
                id: 'yoga_mat',
                type: 'study_spot',
                position: { x: -35, y: 1, z: -50 },
                action: 'yoga',
                description: 'Yoga and stretching area'
            }
        ],
        capacity: 20,
        accessLevel: 'public',
        activities: [
            {
                id: 'cardio_workout',
                name: 'Cardio Workout',
                description: 'Virtual cardio exercise session',
                type: 'exercise',
                xpReward: 40,
                coinReward: 15,
                duration: 20
            },
            {
                id: 'strength_training',
                name: 'Strength Training',
                description: 'Virtual strength training session',
                type: 'exercise',
                xpReward: 50,
                coinReward: 20,
                duration: 30
            }
        ]
    }
];

const seedCampus = async () => {
    try {
        await connectDB();

        // Clear existing locations
        await VirtualCampus.deleteMany({});

        // Insert new locations
        for (const location of campusLocations) {
            const newLocation = new VirtualCampus(location);
            await newLocation.save();
        }

        console.log('✅ Campus locations seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding campus:', error);
        process.exit(1);
    }
};

seedCampus();
