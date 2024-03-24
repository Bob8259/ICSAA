# CAPTCHA is dead, but not ICSAA

## How to use ICSAA v1

1, Download Node js  v21.7.1. The newer version is supposed to work but not guaranteed.
[Node.js](https://nodejs.org/en/download)
2, Download [VS Code](https://code.visualstudio.com/)
3, Clone this project or Download ZIP
![](https://raw.githubusercontent.com/Bob8259/IPSAA/main/image/zip.jpg)
4, Unzip the file, and open it with VS Code.

5, Add your MongoDB connection URI to the .env file. The CAPTCHA information will be uploaded to your database.

If you do not want to upload the data to your database. Delete this file: ISPAA\app\lib\db.js
In this file: ISPAA\app\api\getCAPTCHA\route.js delete line 3 (`import { connectToDB } from "@/app/lib/db";`), line 94 (`await db.collection("CAPTCHA").insertOne(body);`) and line 106 (`await db.client.close();`).

5, In VS Code, press Ctrl+Shift+\` to open a new terminal, then type `npm i`and press Enter to run the command. Then run`npm run dev`, Now, you can visit http://localhost:3000/api/getCAPTCHA, you will get a CAPTCHA id and the base64 string of that image. The content after`splitNotation` are the image data. You can convert it to an image.

## Introduction

CAPTCHA, which stands for Completely Automated Public Turing test to tell Computers and Humans Apart, was designed to distinguish between human and bots, thus preventing bots from accessing certain websites. However, as AI becomes cheaper and better, the conventional CAPTCHA are under great threat. Nowadays AI can bypass most CAPTCHA with ease, which is a potential danger for most websites, especially those that want to prevent data scraping. There is a significant gap in how to improve the security of CAPTCHA since most of the studies were about bypassing CAPTCHA, how to design user-friendly CAPTCHA and privacy problems with CAPTCHA. This project proposed a new idea for CAPTCHA, aiming to fill the security gap. The name ICSAA stands for Image CAPTCHA which is Secure Against AI. This project is the base version, and the advanced version will be released soon.
## Current concerns

Nowadays, there are various versions of CAPTCHA. However, none of those are secure against bots. This paragraph will discuss the potential weak points of the current CAPTCHA. This [GitHub project](https://github.com/sml2h3/ddddocr) provides some solutions for some current CAPTCHA. Some of the following examples use the code or images from that project.
Some of the following examples are from the Internet. The following examples are for research and study only. If you use the following examples to commit illegal acts, you will be responsible for the consequences

1. **Traditional Text CAPTCHA**
   
   This type of CAPTCHA requires the user to input the text which is written in a distorted way. With the development of OCR (Optical character recognition), this type of CAPTCHA can be bypassed easily. For example, Google Gemini and 通义千问 can recognize the CAPTCHA.
   
   ![](https://raw.githubusercontent.com/Bob8259/IPSAA/main/image/text1.png)
   
   ![](https://raw.githubusercontent.com/Bob8259/IPSAA/main/image/text2.png)

3. **Image selection or Text selection**
   
   This type of CAPTCHA requires the user to select certain images from another image. Some Chinese version of CAPTCHA requires the user to select certain Chinese characters from another image. This can be bypassed using image searching or OCR. The following are some examples.
   
   ![](https://raw.githubusercontent.com/Bob8259/IPSAA/main/image/item%20selection%20question.png)
   
   ![](https://raw.githubusercontent.com/Bob8259/IPSAA/main/image/item%20selection%20answer.png.png)
   
   ![](https://raw.githubusercontent.com/Bob8259/IPSAA/main/image/text%20selection.png)
4. **Slice or Puzzle CAPTCHA**
   This type of CAPTCHA can be solved using an edge detection algorithm, or brute force attacks. Here are some examples.
   
   [Brute force attack example.](https://dai.ly/k2ai24YfIvQxXVAj1jG)
   
   ![](https://raw.githubusercontent.com/Bob8259/ICSAA/main/image/slice.png)
4. **Rotation CAPTCHA**
   This type of CAPTCHA is a classification problem, which can be solved using AI or brute force attacks. Here are some examples.
   3d rotation
   
   ![](https://raw.githubusercontent.com/Bob8259/ICSAA/main/image/3d%20rotation.png)
   2d rotation

   ![](https://raw.githubusercontent.com/Bob8259/ICSAA/main/image/2d%20rotation.png)
5. **Maze CAPTCHA**
   This type of CAPTCHA is a recursive search problem. The obstacles can be detected using various methods, and then a path-finding algorithm can be applied to solve the problem.
   In some typical cases, this CAPTCHA is also vulnerable to brute force attacks.
   [Avoid object CAPTCHA](https://dai.ly/kXmeubCgUu72HXAj1jI)

6. **NoCAPTCHA CAPTCHA**
   No CAPTCHA was designed to improve the user experience by 'removing' the CAPTCHA interface while detecting the bot or automated action. Though it seems promising, current tricks such as [DrissionPage](https://github.com/g1879/DrissionPage?tab=readme-ov-file) can bypass it easily. 
   
7. **Other unsafe CAPTCHA**
   Most other CAPTCHA such as reCAPTCHA or FunCAPTCHA are also unsafe. Because they can be bypassed by AI or vulnerable to brute force attacks. Here are some examples.
   [3d Rotation CAPTCHA force attack](https://dai.ly/k3NDWDtKwK7zzTAj0Y6)
   
   reCAPTCHA example
   ![](https://raw.githubusercontent.com/Bob8259/ICSAA/main/image/reCAPTCHA.png)
   
## Analyzation
There are some CAPTCHA which look promising since there is no solution found. Such are the following two CAPTCHA.
![](https://raw.githubusercontent.com/Bob8259/ICSAA/main/image/safe%20captcha.png)

However, the first CAPTCHA has some potential weak points. The algorithms need to track the yellow line and find the endpoint, which is not hard to do.
The second match puzzle CAPTCHA is better since it is hard for AI to judge whether an object is complete or not. However, the CAPTCHA in this example is vulnerable to brute force attacks. But this idea can be applied to the 2D puzzle CAPTCHA such that it will be safe against brute force attacks. Further discussion will be made later.
## Definition
What makes a CAPTCHA a good CAPTCHA? A good CAPTCHA should meet the following requirements. 
1. User-friendly level
User-friendly means whether a real person can solve the CAPTCHA in a short time or not. 
reCAPTCHA takes 4-15 seconds to solve while a 2D rotation CAPTCHA takes 2-4 seconds to solve. So 2D rotation CAPTCHA is more user-friendly.
2. Data-friendly level
Data-friendly means whether the CAPTCHA requires a large amount of data to generate a CAPTCHA.
For example, reCAPTCHA needs a large amount of images  to generate a random CAPTCHA while a text CAPTCHA only needs to store 10 numbers and 26 letters. So text CAPTCHA is more data-friendly
3. Anti-bot recognition level
Anti-bot recognition means whether the CAPTCHA can be recognized and solved by a bot. For example, reCAPTCHA can be easily recognized and solved by a bot while the matching puzzle can not be solved by a bot. So matching puzzle CAPTCHA has a high anti-bot recognition level.
4. Anti-brute force attack level
Anti-brute force attack means whether the CAPTCHA can be bypassed brutally. For example, slice CAPTCHA can be bypassed brutally while reCAPTCHA can not. So reCAPTCHA has a higher anti-brute force attack level.

The following table shows the information for some common CAPTCHA, the full mark for each attribute is 5. The higher the mark means the better.

|  Name | User-friendly  |Data friendly | Anti bot recognition level  | Anti brute force attack level |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| Text CAPTCHA| 5 | 5| 0  |  5 |
| Selection CAPTCHA| 4 | 4| 1  |  4 |
| Slice CAPTCHA|5 | 5| 0  |  1 |
| 2D Rotation CAPTCHA| 4 | 3| 1  |  1 |
| 3D Rotation CAPTCHA| 4 | 3| 3  |  2 |
| Maze CAPTCHA| 3 | 4| 2  |  4 |
|reCAPTCHA|1|0|1|5|
|NoCAPTCHA|5|5|0|0|
|ICSAA|2|5|5|5|
   
