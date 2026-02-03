import fs from "fs";

//synchronously.....
// fs.writeFileSync("example.txt","Hello vaibjav!");


// fs.writeFile("example.txt", "Hello yeshwanth", (err) => {
//   if (err) {
//     console.error("Error writing file:", err);
//     return;
//   }     
// });
// console.log("File written successfully.");

// const result = fs.readFileSync("./contact.txt", "utf-8");

// console.log(result);


// fs.readFile("./contact.txt","utf-8",(err,result)=>{
//     if(err){
//         console.error("Error reading file:", err);
//     }else{
//         console.log(result);
//     }
// })

fs.appendFileSync("example.txt",new Date().toISOString() + "\n");
fs.cpSync("./example.txt","./example_copy.txt");

fs.unlinkSync("./example_copy.txt");

fs.mkdirSync("new_folder/a/b",{recursive:true});