'use strict'
const User = use("App/Models/User");

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

class UserSeeder {
  async run () {
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "bc1qcwzz82k5qn07htcqmxl4yzf2rj472tu8n8n2s4", name: "Frank Perea", role: "doctor", address: "14th Street, Rua del Percebe", phone: "+17123498752", email:"auson@email.com"})
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT", name: "Isabelle Dias", role: "doctor", address: "Calle san Jeronimo", phone: "+3419084152", email:"smith@email.com"})
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "3PobkaJ8sLucgpRsMwsCeAmeudV8hQZvVG", name: "Lauren Stwart", role: "clinic manager", address: "21th streen, Iliago sintra", phone: "+32109328123", email:"mike@email.com"})
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "1EUpXu4dkYFai9erhv28LjKWq9fVkWtmwK", name: "Adam Smith", role: "doctor", address: "2nd Street, Pegaso views", phone: "+52345345132", email:"lolta@email.com"})
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "1Zmnbz1DPyuGuPSJ8Yeo4KFSxYbmCbp4g", name: "John Locke", role: "staff", address: "Avda de las naciones, Asimov viba", phone: "+41235123523", email:"asge@email.com"})
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "3BMEXWusEJL7CZUf1RXq67FsSYijK5jX5D", name: "Myriam Loles", role: "doctor", address: "High Park street, Loker rekoas", phone: "+12343452435", email:"scert@email.com"})
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "1BJGu2JP5KPbMnX7d5U6i5kVG8kuizhD8s", name: "Hodor Roda", role: "staff", address: "Wall builders street, 32f f2a4", phone: "+156324153454", email:"asewa@email.com"})
    await User.create({clinic_id: Math.floor(Math.random() * 10), wallet: "16TepkFKg5LFWouvjPiV5yhwkHpPMGu5s7", name: "Jennifer Smitsa", role: "staff", address: "14th Street, Rua del Percebe", phone: "+134532345534", email:"yhame@email.com"})
  }
}

module.exports = UserSeeder
