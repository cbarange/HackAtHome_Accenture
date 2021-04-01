// NUMBER=3 node exo_test.js > out_3.csv

// --- Import lib ---
const fs = require('fs')
const Papa = require('papaparse')

// Oui oui on fait des essais en randomisant le tableau 😢
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// --- File Configuration ---
const server_file = './codecontest_fr_df_accenturehackathome/servers_catalog.csv'
const in_file = `./in/ctstfr0280_input_${process.env.NUMBER}.csv`

// --- Convert file ---
const server_content = fs.readFileSync(server_file, "utf8");
const in_content = fs.readFileSync(in_file, "utf8");

// --- Retrieve SERVER model ---
let server_rows;
Papa.parse(server_content, {
  header: false,
  delimiter: ',',
  complete: results => server_rows = results.data
})
// [ 'model', 'co2production', 'co2usage', 'disk', 'ram', 'cores' ]
servers = server_rows.slice(1).map(e=>{ return {model:e[0],co2production:e[1], co2usage:e[2], disk:e[3], ram:e[4], cores:e[5]} })

// --- Retrieve SERVICE ---
let service_rows;
Papa.parse(in_content, {
  header: false,
  delimiter: ',',
  complete: results => service_rows = results.data
})
age_service = parseInt(service_rows[0])
// [ 'nom', 'stockage', 'ram', 'cpu' ],
services = service_rows.slice(1).map(e=>{return {nom:e[0], disk:e[1], ram:e[2], cores:e[3]}})

// --- Add cost to server ---
servers=servers.map(e=>{ return {...e, cost:parseInt(e.co2production)+parseInt(e.co2usage)*age_service}})

// --- Sort Serveur ---
servers=servers.sort((a,b)=>a.cost-b.cost)

// --- Sort Service ---
services=services.sort((a,b)=>b.disk-a.disk && b.cores-a.cores || b.ram-a.ram)
//services=shuffle(services)

// --- ALGO HERE ---
added_serveurs = []

services.forEach(service=>{
  let isServiceInserted = false
  
  added_serveurs.forEach((added_serveur,i)=>{
    // Si dans les serveur ajouter on a de la place
    if(added_serveur.disk-service.disk>=0 && added_serveur.cores-service.cores>=0 && added_serveur.ram-service.ram>=0) {

      added_serveur.disk = added_serveur.disk-service.disk
      added_serveur.ram = added_serveur.ram-service.diramsk
      added_serveur.cores = added_serveur.cores-service.cores
      added_serveur.services = [...added_serveur.services, service]
      
      isServiceInserted = true
    }
  })  

  if(!isServiceInserted){
    servers.forEach((server,i)=> {
      if(!isServiceInserted && server.disk-service.disk>=0 && server.cores-service.cores>=0 && server.ram-service.ram>=0) {
        let new_server

        // if(i<servers.length-1) {
        //   new_server={...servers[i+1]}
        //   new_server.disk = new_server.disk-service.disk
        //   new_server.ram = new_server.ram-service.diramsk
        //   new_server.cores = new_server.cores-service.cores
        //   new_server.services = [service]    
        // } else {
          new_server = {
            model:server.model,co2production:server.co2production, co2usage:server.co2usage,cost:server.cost, 
            disk:server.disk-service.disk,
            ram:server.ram-service.ram,
            cores:server.cores-service.cores, services:[service]
          }  
        // }

        added_serveurs.push(new_server)

        // added_serveurs=added_serveurs.sort((a,b)=>a.cost-b.cost)

        isServiceInserted = true
        
      }
    })
  }
})


console.log(added_serveurs.map(e=>`${e.model},${e.services.map(s=>s.nom).join`,`}`).join`\n`)

console.error(added_serveurs.reduce((r,e)=>r=r+parseInt(e.cost),0))