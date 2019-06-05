'use strict'
const fs = require("fs")
const Logger = use('Logger')
const PdfDocument = require('pdfkit')
const PdfTable = require('voilab-pdf-table')
const sudo = require('sudo-js');


const Env = use('Env')
class PdfService {


  autoDeletePdf(path){
    //   wait until 1 min to self-destruct pdf passport
    setTimeout(function(){
      sudo.setPassword(Env.get('SUDO_PASSWORD'))

    //   Create command
      const command = ['rm', '-rf', "public/temp/"+path];
      sudo.exec(command, function(err, pid, result) {

        //   If any error log it
        if (err) {
          Logger.error(err)
        }

        // if any result log it
        if (result) {
          Logger.info(result)
        }
      });

    //   announce the file has been removed
      Logger.warning(path + " has been self-removed")
    }, 60000);
  }

  generatePDF(data, name) {
      // select full relative path
    let filename = "public/temp/" + name + ".pdf"
    try {
        // set up user encrypted password in case of not being encrypted
      let pass = ""
      if (data.password != undefined) {
        pass = data.password
      }
      // create a PDF from PDFKit, and a table from PDFTable
      var pdf = new PdfDocument({
          autoFirstPage: false,
          userPassword: pass,
          ownerPassword: pass,
          permissions: {
            annotating: true,
            copying: false,
            modifying: false,
            printing: "highResolution"
          }
         
        }),
        table = new PdfTable(pdf, {
          topMargin: 100
        }),
        allergyTable = new PdfTable(pdf, {
          topMargin: 100
        }),
        conditionTable = new PdfTable(pdf, {
          topMargin: 100
        }),
        mediactionTable = new PdfTable(pdf, {
          topMargin: 100
        }),
        patientTable = new PdfTable(pdf, {
          topMargin: 100
        }),
        immunisationTable = new PdfTable(pdf, {
          topMargin: 100
        });
        pdf.pipe(fs.createWriteStream(filename))

      table
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(new(require('voilab-pdf-table/plugins/fitcolumn'))({
          column: 'value'
        }))
        // set defaults to your columns
        .setColumnsDefaults({
          headerBorder: 'B',
          align: 'justify',
        })
        // add table columns
        .addColumns([{
            id: 'title',
            header: 'SOCIAL HISTORY',
            align: 'left',
            width: 150
          },
          {
            id: 'value',
            header: '',
          }
        ])


        patientTable
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(new(require('voilab-pdf-table/plugins/fitcolumn'))({
          column: 'value'
        }))
        // set defaults to your columns
        .setColumnsDefaults({
          headerBorder: 'B',
          align: 'justify',
        })
        // add table columns
        .addColumns([
          {
            id: 'title',
            header: 'PATIENT INFORMATION',
            align: 'left',
            width: 150,
          },
          {
            id: 'value',
            header: '',
          }
        ])

        mediactionTable
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(new(require('voilab-pdf-table/plugins/fitcolumn'))({
          column: 'value'
        }))
        // set defaults to your columns
        .setColumnsDefaults({
          headerBorder: 'B',
          align: 'justify',
        })
        // add table columns
        .addColumns([
          {
            id: 'title',
            header: 'MEDICATION PRESCRIPTION',
            align: 'justify',
            width: 150,
          },
          {
            id: 'value',
            header: '',
          }
        ])


        allergyTable
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(new(require('voilab-pdf-table/plugins/fitcolumn'))({
          column: 'value'
        }))
        // set defaults to your columns
        .setColumnsDefaults({
          headerBorder: 'B',
          align: 'justify',
        })
        // add table columns
        .addColumns([{
            id: 'title',
            header: 'ALLERGIES',
            align: 'left',
            width: 150
          },
          {
            id: 'value',
            header: '',
          }
        ])

        conditionTable
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(new(require('voilab-pdf-table/plugins/fitcolumn'))({
          column: 'value'
        }))
        // set defaults to your columns
        .setColumnsDefaults({
          headerBorder: 'B',
          align: 'justify',
        })
        // add table columns
        .addColumns([{
            id: 'title',
            header: 'CONDITIONS',
            align: 'left',
            width: 150
          },
          {
            id: 'value',
            header: '',
          }
        ])

        immunisationTable
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(new(require('voilab-pdf-table/plugins/fitcolumn'))({
          column: 'value'
        }))
        // set defaults to your columns
        .setColumnsDefaults({
          headerBorder: 'B',
          align: 'justify',
        })
        // add table columns
        .addColumns([{
            id: 'title',
            header: 'IMMUNISATIONS',
            align: 'left',
            width: 150
          },
          {
            id: 'value',
            header: '',
          }
        ])


      // if no page already exists in your PDF, do not forget to add one
      pdf.addPage()

        // If data about bitcoin confirmation has been provided include a section for
        // further validation 
      if (data.certification) {
         const ipfsLink = "https://ipfs.io/ipfs/" + data.certification.hash

        //*********************************************
        //************* CERTIFICATION DATA ************
        //*********************************************
        pdf
        .image('public/img/logo.png', 250, 60, {
          align: 'center',
          scale: 0.2
        })
        .moveDown()
        // Add title
        .font('public/fonts/bold.ttf', 25)
        .text('Avicenna Passport Certification',{
          align: 'center',
        }, 170, 50)
        .font('public/fonts/roboto.ttf', 13)
        .moveDown()
        // Add body
        .text("Avicenna certifies that the atached file identified with the IPFS gateway hash ", {
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true,
          continued: true
        })
        .fillColor('blue')
        .font('public/fonts/roboto.ttf', 13)
        .text(data.certification.hash + ' ',{
          link: ipfsLink,
          underline: true,
          continued: true
        })
        .fillColor('black')
        .font('public/fonts/roboto.ttf', 13)
        if (data.certification.satellite) {
        pdf.text(" saved in the Blockstream Satellite with the Tramsission ID ", {
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          underline: false,
          ellipsis: true,
          continued: true
        })
        .fillColor('blue')
        .font('public/fonts/roboto.ttf', 13)
        .text(data.certification.satellite.uuid,{
          link: "/passport/validate",
          underline: true,
          continued: true
        })
        .fillColor('black')
        .font('public/fonts/roboto.ttf', 13)
        .text(" and the Authorization Token ", {
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true,
          underline: false,
          continued: true
        })
        .fillColor('blue')
        .font('public/fonts/roboto.ttf', 13)
        .text(data.certification.satellite.authToken,{
          link: "/passport/validate",
          underline: true,
          continued: true
        })
        .fillColor('black')
        .font('public/fonts/roboto.ttf', 13)
        .text(".", {
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true,
          underline: false
        })

        } else if(data.certification.ots) {

        const otsIpfsLink = "https://ipfs.io/ipfs/" + data.certification.ots.verification
        pdf.text(", certified using ", {
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true,
          continued: true,
          underline: false
        })
        .fillColor('blue')
        .font('public/fonts/roboto.ttf', 13)
        .text('OpenTimeStamps',{
          link: "https://opentimestamps.org/",
          underline: true,
          continued: true
        })
        .fillColor('black')
        .font('public/fonts/roboto.ttf', 13)
        .text(" with the stamp ", {
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true,
          underline: false,
          continued: true
        })
        .fillColor('blue')
        .font('public/fonts/roboto.ttf', 13)
        .text(data.certification.ots.verification,{
          link: otsIpfsLink,
          underline: true,
          continued: true
        })
        .fillColor('black')
        .font('public/fonts/roboto.ttf', 13)
        .text(".", {
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true,
          underline: false
        })

        }

        pdf.moveDown()
        .fillColor('black')
        .font('public/fonts/bold.ttf', 19)
        .text( "Passport Emitter",{
          width: 470,
          align: 'center',
          indent: 30,
          height: 300,
          ellipsis: true
        })
        .moveDown()
        .font('public/fonts/roboto.ttf', 13)
        .text( "This medical passport has been emitted by " + data.doctor.name + ", " + data.doctor.role + " at the " + data.doctor.clinic + ". This institution is located at " + data.doctor.clinicAddress + " and can be reachable via email ("+data.doctor.email+") or phone ("+data.doctor.phone+"). Avicenna certifies that the Declaration Terms represented in the next parargraph have been signed digitally using the following Bitcoin public key: ",{
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true
        })
        .fillColor('blue')
        .font('public/fonts/roboto.ttf', 13)
        .text(data.certification.wallet,{
          link: "http://chainquery.com/bitcoin-api/verifymessage",
          underline: true,
          continued: true
        })
        .fillColor('black')
        .font('public/fonts/roboto.ttf', 13)
        .text( " and with the signature hash: ",{
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true,
          underline: false,
        })
        .fillColor('blue')
        .font('public/fonts/roboto.ttf', 13)
        .text(data.certification.signature,{
          link: "http://chainquery.com/bitcoin-api/verifymessage",
          underline: true
        })
        .moveDown()
        .fillColor('black')
        .font('public/fonts/bold.ttf', 19)
        .text( "Passport Emitter Declaration",{
          width: 470,
          align: 'center',
          indent: 30,
          height: 300,
          ellipsis: true
        })
        .moveDown()
        .font('public/fonts/italic.ttf', 11)
        .text( data.certification.message,{
          width: 470,
          align: 'justify',
          indent: 30,
          height: 300,
          ellipsis: true
        })
        .font('public/fonts/italic.ttf', 13)
        .moveDown()
        .addPage()
  
        if (data.image) {
        pdf.image(data.image.tmpPath, {
          align: 'center',
          width: 120,
          height: 120
        })
        pdf.moveDown()
        }

      }
        //*********************************************
        //*********** PATIENT SENSITIVE DATA **********
        //*********************************************

        // Add patient image
      if (data.image && !data.certification) {
        pdf
        .image(data.image.tmpPath, {
          align: 'center',
          width: 120,
          height: 120
        })
        pdf.moveDown()
      }

        patientTable.addBody([
          { 
            title: 'DNA Sequence',
            value: data.patient.dna,
          },
          { 
            title: 'Blood Type',
            value: data.patient.blood,
          },
          { 
          title: 'Full Name',
          value: data.patient.name,
        },
        {
          title: 'DOB',
          value: data.patient.dob,
        },
        {
          title: 'Gender',
          value: data.patient.gender,
        },
        {
          title: '',
          value: '',
        },
      ])

      if (data.report) {        
      data.report.forEach(element => {
        pdf.moveDown()
        conditionTable.addBody([
          {
          title: 'Condition Type',
          value: element.condition
        },
        {
          title: 'Condition Year',
          value: element.year
        },
        {
          title: 'Condition Notes',
          value: element.notes
        },
        {
          title: '',
          value: "",
        }
      ])
      })
    }
      if (data.allergy) {
        data.allergy.forEach(element => {
          pdf.moveDown()
          allergyTable.addBody([
            {
            title: 'Allergy',
            value: element.name
          },
          {
            title: 'High Risk',
            value: element.risk
          },
          {
            title: 'Allergy Notes',
            value: element.notes
          },
          {
            title: '',
            value: "",
          }
        ])
        })
      }

      if (data.immunisation) {
        data.immunisation.forEach(element => {
          pdf.moveDown()
          immunisationTable.addBody([
            {
            title: 'Immunisation',
            value: element.name
          },
          {
            title: 'Year',
            value: element.year
          },
          {
            title: '',
            value: "",
          }
        ])
        })
      }
      if (data.medication) {
        data.medication.forEach(element => {
          pdf.moveDown()
          mediactionTable.addBody([
            {
            title: 'Medication',
            value: element.name
          },
          {
            title: 'Dose',
            value: element.dose
          },
          {
            title: '',
            value: "",
          },
          {
            title: 'Monday',
            value: element.monday,
          },
          {
            title: 'Tueday',
            value: element.tuesday,
          },
          {
            title: 'Wednesday',
            value: element.wednesday,
          },
          {
            title: 'Thursday',
            value: element.thursday,
          },
          {
            title: 'Friday',
            value: element.friday,
          },
          {
            title: 'Saturday',
            value: element.saturday,
          },
          {
            title: 'Sunday',
            value: element.sunday,
          },
          {
            title: 'Plan Care',
            value: element.plan,
          }
        ])
        })
      }
      pdf.moveDown()


      if (data.social) {
          pdf.moveDown()
          table.addBody([{
            
          title: 'Mobility',
          value: data.social.mobility,
        },
        {
          title: 'Eating & Drinking',
          value: data.social.eating,
        },
        {
          title: 'Dressing',
          value: data.social.dressing,
        },
        {
          title: 'Toileting',
          value: data.social.toileting,
        },
        {
          title: 'Washing',
          value: data.social.washing,
        },
        {
          title: 'Notes on functions and activies',
          value: data.social.activity,
        },
        {
          title: 'Notes on behaviour',
          value: data.social.behaviour,
        }
        ])
      }
    //   Finish the PDF writter
      pdf.end()

    //   Announce the PDF has been generated
      Logger.info('PDF GENERATED')

    // Return the PDF file path
      return  name+".pdf"
    } catch (error) {
      Logger.error(error)
    }
  }

    // Format the date to be eeasily represented for the UX
   formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' of ' + monthNames[monthIndex] + ' of ' + year + ' at ' + hours + ':' + minutes + ':' + seconds;
  }
}

module.exports = new PdfService()
