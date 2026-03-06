const fs = require('fs');
let content = fs.readFileSync('app/admin/dashboard/page.tsx', 'utf8');

// The markers to find:
// <<<<<<< HEAD
// =======
// >>>>>>> f082fe...

let parts = content.split(/<<<<<<< HEAD\r?\n/);
let newContent = parts[0];

for (let i = 1; i < parts.length; i++) {
    let part = parts[i];
    let equalSplit = part.split(/=======\r?\n/);
    if (equalSplit.length > 1) {
        let afterEquals = equalSplit[1];
        // Split at >>>>>>>
        let greaterSplit = afterEquals.split(/>>>>>>> .*\r?\n/);
        
        let incomingCode = greaterSplit[0];
        let remainingCode = greaterSplit[1];
        
        newContent += incomingCode + remainingCode;
    }
}

newContent = newContent.replace(/notification\.type/g, 'notification?.type');
newContent = newContent.replace(/notification\.message/g, 'notification?.message');

fs.writeFileSync('app/admin/dashboard/page.tsx', newContent);
console.log('Fixed page using split!');
