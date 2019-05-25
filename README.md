# Avicenna
###### An open, peer-to-peer and offline healthcare system backed by a distributed infrastructure 

## Background - Insight of a specific case

The Lebanese Association of the Order of Malta (LAKM) is the primary health provider via 4 mobile clinics for more than 200,000 individuals, including up to 40,000 in Akkar.
The large majority of users (95%) are Syrian refugees, a disadvantaged and vulnerable group.
The service faces several operational challenges:
* Patients with complex medical needs.
* Limited resources and limited links to specialist care.
* Reliance on paper records.
* Difficult to monitor clinical activity, expenses, and produce reports

## Introduction
Avicenna solves frontline problems in healthcare using blockchain and decentralised technology. Although this is a hackathon project, the goal is to create an open and connected healthcare system to support the United Nation Sustatinable Development Goals (SDGs). Avicenna pursues following SDGs:

###  [Goal 3: Ensure healthy lives and promote well-being for all at all ages](https://www.un.org/sustainabledevelopment/health/)
Achieving the target of reducing premature deaths due to incommunicable diseases by 1/3 by the year 2030 would also require more efficient technologies, Avicenna provides a digital health and social care ‘passport’ for each patient, accessible via a unique QR code printed on a card at no cost and evene offline service, for reduced inequalittties without access to digital resources.  

Many more efforts are needed to fully eradicate a wide range of diseases and address many different persistent and emerging health issues. By focusing on providing more efficient health systems, improved sanitation and communication to helps doctors and volunteers serve patients with an open infrastructure, significant progress can be made in helping to save the lives of millions.

###  [Goal 10: Reduce inequality within and among countries](https://www.un.org/sustainabledevelopment/inequality/)
There is growing consensus that economic growth is not sufﬁcient to reduce poverty if it is not inclusive and if it does not involve the three dimensions of sustainable development – economic, social and environmental. Communities with a low eeconomical infrastructure are not able to provide 

To reduce inequality, Avicenna provides an open healthcare infrastructure to be universal in principle, paying attention to the needs of disadvantaged and marginalized individuals. At the hands of volunteers and doctors, Hippocrartes digitilise clinics allowing notes to be recorded electronically - improving quality, and reducing reliance on paper notes. It provides to every patient their own digital health ‘passport’ that they can access securely and even with no internet access from anywhere.
 

## Technology
Avicenna uses and blockchain and decentralised infrastructure for security, accountability and connectivity. Th tech stack contains:
* IPFS - for distributed p2p file sharing and ecnrypting
* Ethereum - for smart contracts
* MySQL - for clinic management


## Gettings Started
1. Clone the repository: `sudo git clone https://github.com/whiteyhat/Avicenna`
2. Install the dependencies: `npm i`
3. Edit your enviromental variables at thee file `.env`
4. Run the DB migrations to your local database 
```js
adonis migration:run
```
5. Start the web app: `npm start`
