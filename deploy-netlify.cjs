const { execSync } = require('child_process');
try {
    const result = execSync('npx netlify deploy --prod --dir=dist', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(result);
} catch (error) {
    console.error('Deploy error:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
}
