const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const courses = [
    // Level 100 First Semester
    { courseCode: 'AFR1001', courseName: 'African Studies', level: '100', semester: '1' },
    { courseCode: 'CMP1001', courseName: 'Computer Literacy', level: '100', semester: '1' },
    { courseCode: 'COM1001', courseName: 'Communication Skills I', level: '100', semester: '1' },
    { courseCode: 'DIS1001', courseName: 'Dispensing Techniques I', level: '100', semester: '1' },
    { courseCode: 'DIS1001P', courseName: 'Dispensing Techniques practicals I', level: '100', semester: '1' },
    { courseCode: 'CHEM1001', courseName: 'Chemistry I', level: '100', semester: '1' },
    { courseCode: 'CHEM1001P', courseName: 'Chemistry practicals I', level: '100', semester: '1' },
    { courseCode: 'PHY1001', courseName: 'Physiology I', level: '100', semester: '1' },
    { courseCode: 'FAD1001', courseName: 'First Aid', level: '100', semester: '1' },
    { courseCode: 'HSP1001', courseName: 'Hospital practice I', level: '100', semester: '1' },

    // Level 100 Second Semester
    { courseCode: 'DIS1002', courseName: 'Dispensing Techniques II', level: '100', semester: '2' },
    { courseCode: 'DIS1002P', courseName: 'Dispensing Techniques practicals II', level: '100', semester: '2' },
    { courseCode: 'CHEM1002', courseName: 'Chemistry II', level: '100', semester: '2' },
    { courseCode: 'CHEM1002P', courseName: 'Chemistry practicals II', level: '100', semester: '2' },
    { courseCode: 'PHY1002', courseName: 'Physiology II', level: '100', semester: '2' },
    { courseCode: 'HSP1002', courseName: 'Hospital practice II', level: '100', semester: '2' },
    { courseCode: 'COM1002', courseName: 'Communication Skills II', level: '100', semester: '2' },
    { courseCode: 'AFR1002', courseName: 'African Studies', level: '100', semester: '2' },

    // Level 200 First Semester
    { courseCode: 'MIC2001', courseName: 'Basic Pharmaceutical Microbiology', level: '200', semester: '1' },
    { courseCode: 'MIC2001P', courseName: 'Basic Pharmaceutical Microbiology Practicals', level: '200', semester: '1' },
    { courseCode: 'THER2001', courseName: 'Therapeutics I', level: '200', semester: '1' },
    { courseCode: 'HSP2001', courseName: 'Hospital practice III', level: '200', semester: '1' },
    { courseCode: 'FOR2001', courseName: 'Forensic I', level: '200', semester: '1' },
    { courseCode: 'MGT2001', courseName: 'Basic Management', level: '200', semester: '1' },
    { courseCode: 'PCH2001', courseName: 'Physical Chemistry', level: '200', semester: '1' },
    { courseCode: 'PCH2001P', courseName: 'Physical Chemistry practicals', level: '200', semester: '1' },
    { courseCode: 'ENT2001', courseName: 'Pharmaceutical Entrepreneurship', level: '200', semester: '1' },

    // Level 200 Second Semester
    { courseCode: 'QCI2001', courseName: 'Quality Control and Instrumentation Technology I', level: '200', semester: '2' },
    { courseCode: 'QCI2001P', courseName: 'Quality Control and Instrumentation Technology practicals I', level: '200', semester: '2' },
    { courseCode: 'DIS2001', courseName: 'Dispensing Techniques III', level: '200', semester: '2' },
    { courseCode: 'DIS2001P', courseName: 'Dispensing Techniques practicals III', level: '200', semester: '2' },
    { courseCode: 'STK2001', courseName: 'Store Keeping', level: '200', semester: '2' },
    { courseCode: 'ORG2001', courseName: 'Organic Chemistry IV', level: '200', semester: '2' },
    { courseCode: 'ORG2001P', courseName: 'Organic Chemistry practicals IV', level: '200', semester: '2' },
    { courseCode: 'THER2002', courseName: 'Therapeutics II', level: '200', semester: '2' },
    { courseCode: 'RES2001', courseName: 'Research Methodology', level: '200', semester: '2' },
    { courseCode: 'STAT2001', courseName: 'Statistics', level: '200', semester: '2' }
];

async function populateCourses() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing courses
        console.log('🧹 Clearing existing courses...');
        await Course.deleteMany({});
        console.log('✅ Cleared existing courses');

        // Insert new courses
        console.log('📚 Inserting course catalogue...');
        const insertedCourses = await Course.insertMany(courses);
        console.log(`✅ Successfully inserted ${insertedCourses.length} courses`);

        // Display summary
        const level100Sem1 = insertedCourses.filter(c => c.level === '100' && c.semester === '1');
        const level100Sem2 = insertedCourses.filter(c => c.level === '100' && c.semester === '2');
        const level200Sem1 = insertedCourses.filter(c => c.level === '200' && c.semester === '1');
        const level200Sem2 = insertedCourses.filter(c => c.level === '200' && c.semester === '2');

        console.log('\n📊 Course Summary:');
        console.log(`Level 100 First Semester: ${level100Sem1.length} courses`);
        console.log(`Level 100 Second Semester: ${level100Sem2.length} courses`);
        console.log(`Level 200 First Semester: ${level200Sem1.length} courses`);
        console.log(`Level 200 Second Semester: ${level200Sem2.length} courses`);

        // Display all courses
        console.log('\n📖 Complete Course Catalogue:');
        insertedCourses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseCode} - ${course.courseName} (Level ${course.level}, Semester ${course.semester})`);
        });

    } catch (error) {
        console.error('❌ Error populating courses:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔐 MongoDB connection closed');
        process.exit(0);
    }
}

populateCourses();