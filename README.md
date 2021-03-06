# Avicenna
###### A healthcare system backed by a distributed infrastructure and Bitcoin technology

[![video avicenna](https://user-images.githubusercontent.com/31220861/60285068-6636c200-990d-11e9-9689-1b4a085331dd.png)](https://youtu.be/QeHas3-4gb8)

## Background - Insight of a specific case

The Lebanese Association of the Order of Malta (LAKM) is the primary health provider via 4 mobile clinics for more than 200,000 individuals, including up to 40,000 in Akkar.
The large majority of users (95%) are Syrian refugees, a disadvantaged and vulnerable group.
The service faces several operational challenges:
* Patients with complex medical needs.
* Limited resources and limited links to specialist care.
* Reliance on paper records.
* Difficult to monitor clinical activity, expenses, and produce reports

## Introduction
Avicenna solves frontline problems in healthcare using bitcoin distributed technology. Although this is a hackathon project, the goal is to create an open and connected healthcare system to support the United Nation Sustatinable Development Goals (SDGs). Avicenna pursues following SDGs:

###  [Goal 3: Ensure healthy lives and promote well-being for all at all ages](https://www.un.org/sustainabledevelopment/health/)
Achieving the target of reducing premature deaths due to incommunicable diseases by 1/3 by the year 2030 would also require more efficient technologies, Avicenna provides a digital health and social care ‘passport’ for each patient, accessible via a unique QR code printed on a card at no cost and evene offline service, for reduced inequalittties without access to digital resources.  

Many more efforts are needed to fully eradicate a wide range of diseases and address many different persistent and emerging health issues. By focusing on providing more efficient health systems, improved sanitation and communication to helps doctors and volunteers serve patients with an open infrastructure, significant progress can be made in helping to save the lives of millions.
 

## Tech Stack
Avicenna uses and bitcoin distributed infrastructure for security, accountability and connectivity. The tech stack contains:
* **IPFS** - for distributed p2p file sharing and encrypting
* **Lightning Network** - for tips and micro-payments
* **Blockstream Satellite** - for data integrity certification
* **Open Time Stamps** - for data integrity certification
* **MySQL** - for relative data management
* **Pdfkit** - for PDF document generation
* **Axios** - for backend http requests
* **LN-service** - for non-custodial lightning management
* **Open Node** - For custodial lightning management
* **Sudo-js** - for system management (Self-destruct sensitive data from the system)
* **WebLN** - for client bitcoin management (digital signatures)

## Gettings Started
1. Clone the repository: `sudo git clone https://github.com/whiteyhat/Avicenna`
2. Install the dependencies: `npm i`
3. Create a `.env` with the contents from the [.env.example](https://github.com/whiteyhat/Avicenna/blob/master/.env.example) file
4. Customize your enviromental variables in the file `.env`
5. Run the DB migrations to your local database 
```js
adonis migration:run
```
6. Run the DB seeder to your local database 
```js
npm run db
```
7. Start the web app: `npm start`

## [Project Wiki](https://github.com/whiteyhat/Avicenna/wiki)
Hey! There is a fruitful wiki with more details about the problem we are solving, deployment instructions and additional information. 
