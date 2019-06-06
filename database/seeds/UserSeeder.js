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
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "030c3f19d742ca294a55c00376b3b355c3c90d61c6b6b39554dbc7ac19b141c14f", name: "Frank Perea", role: "doctor", address: "14th Street, Rua del Percebe", phone: "+17123498752", email:"auson@email.com"})
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "02c91d6aa51aa940608b497b6beebcb1aec05be3c47704b682b3889424679ca490", name: "Isabelle Dias", role: "doctor", address: "Calle san Jeronimo", phone: "+3419084152", email:"smith@email.com"})
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "030995c0c0217d763c2274aa6ed69a0bb85fa2f7d118f93631550f3b6219a577f5", name: "Lauren Stwart", role: "clinic manager", address: "21th streen, Iliago sintra", phone: "+32109328123", email:"mike@email.com"})
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "02809e936f0e82dfce13bcc47c77112db068f569e1db29e7bf98bcdd68b838ee84", name: "Adam Smith", role: "doctor", address: "2nd Street, Pegaso views", phone: "+52345345132", email:"lolta@email.com"})
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "0331f80652fb840239df8dc99205792bba2e559a05469915804c08420230e23c7c", name: "John Locke", role: "staff", address: "Avda de las naciones, Asimov viba", phone: "+41235123523", email:"asge@email.com"})
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "02ad6fb8d693dc1e4569bcedefadf5f72a931ae027dc0f0c544b34c1c6f3b9a02b", name: "Myriam Loles", role: "doctor", address: "High Park street, Loker rekoas", phone: "+12343452435", email:"scert@email.com"})
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "026c7d28784791a4b31a64eb34d9ab01552055b795919165e6ae886de637632efb", name: "Hodor Roda", role: "staff", address: "Wall builders street, 32f f2a4", phone: "+156324153454", email:"asewa@email.com"})
    await User.create({clinic_id: Math.random() * (10 - 1) + 1, wallet: "02b6dabd436275044399002241195b82b7fed517b226d0a109b1d07a39d7b4a91a", name: "Jennifer Smitsa", role: "staff", address: "14th Street, Rua del Percebe", phone: "+134532345534", email:"yhame@email.com"})
  }
}

module.exports = UserSeeder
