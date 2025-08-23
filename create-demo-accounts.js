const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Generate password hashes
const studentHash = bcrypt.hashSync('student123', 10);
const professorHash = bcrypt.hashSync('professor123', 10);

console.log('Student hash:', studentHash);
console.log('Professor hash:', professorHash);

// Read existing users
const usersPath = path.join(__dirname, 'server/data/users.json');
let users = [];

try {
  const existingData = fs.readFileSync(usersPath, 'utf8');
  users = JSON.parse(existingData);
} catch (error) {
  console.log('No existing users file, creating new one');
}

// Remove existing demo accounts
users = users.filter(user => !user.email.includes('@demo.com'));

// Add demo accounts
const demoStudent = {
  id: "demo-student-001",
  email: "student@demo.com",
  password: studentHash,
  name: "Demo Student",
  role: "student",
  createdAt: new Date().toISOString()
};

const demoProfessor = {
  id: "demo-professor-001",
  email: "professor@demo.com",
  password: professorHash,
  name: "Demo Professor",
  role: "professor",
  createdAt: new Date().toISOString()
};

users.push(demoStudent, demoProfessor);

// Write back to file
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
console.log('Demo accounts created successfully!');
console.log('Student: student@demo.com / student123');
console.log('Professor: professor@demo.com / professor123');
