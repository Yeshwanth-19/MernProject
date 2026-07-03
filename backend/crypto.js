import crypto from 'crypto';

const data = 'Hello, World!';


const md5 = crypto.createHash('md5').update(data).digest('hex');
console.log('MD5:', md5);

const sha256 = crypto.createHash('sha256').update(data).digest('hex');
console.log('SHA-256:', sha256);

function hashpassword(password) {

    const salt = crypto.randomBytes(16).toString('hex');

    const hash =  crypto.scryptSync(password, salt, 64).toString('hex');

    return { salt, hash };

}