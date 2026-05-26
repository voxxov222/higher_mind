const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('./app/components').filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const len = content.length;
  content = content.replace(/eventSource=\{typeof document !== 'undefined' \? \(document\.getElementById\('root'\) \|\| document\.body\) \: undefined\}\s*/g, '');
  content = content.replace(/eventSource=\{typeof document !== 'undefined' \? document\.getElementById\('root'\) \|\| document\.body \: undefined\}\s*/g, '');
  if (content.length !== len) {
    fs.writeFileSync(f, content);
    console.log(`Updated ${f}`);
  }
});
