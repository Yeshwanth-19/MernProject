


function test(num) {
    if (num === 0) {
        return "Zero";
    } else if (num > 0) {
        if (num % 2 === 0) {
            return "Positive Even";
        } return "Positive Odd";
    } else {

        return "Negative";

    }

}
// Input: marks (0–100)

// Output:

// 90+ → A

// 75–89 → B

// 50–74 → C

// <50 → Fail

// Edge cases matter.
function anotherTest(num) {
        if(num >90){
            return "A";
        }else if(num >=75 && num <=89){
            return "B";
        }else if(num >=50 && num <=74){
            return "C";
        }else{
            return "Fail";
        }
    }

//     3️⃣ Reverse a Number

// Input: 12345
// Output: 54321

// Restrictions

// No converting to string

// Only math + loop

function reverseNumber(num) {
    let number = num;
    let reversed = 0;
    while (number > 0) {
        let digit = number % 10;
        reversed = reversed * 10 + digit;
        number = Math.floor(number / 10);
    }
    return reversed;

}

// [10, 5, 8, 20, 15]

function findMax(arr) {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }   
    }
    return max;
}

// { j:1, a:2, v:1, s:1, c:1, r:1, i:1, p:1, t:1 }

function charCount(str) {

    const count = {};
    for (let char of str) {
        if (count[char]) {
            count[char]++;
        } else {
            count[char] = 1;
        }
    }
    return count;
}