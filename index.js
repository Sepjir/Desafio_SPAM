// Almacenando modulos de node y función "enviar" de nodemailer
const axios = require("axios")
const http = require("http")
const fs = require("fs")
const enviar = require("./mailer.js")
const url = require("url")
const { v4: uuidv4 } = require('uuid')
const moment = require("moment")

//Creación de servidor que disponibilizará las URLS a las que apunta el HTML y su formulario
http
    .createServer((req, res) => {
        let { correos, asunto, contenido } = url.parse(req.url, true).query

//Leyendo el "index.html" en la ruta raíz
        if(req.url == "/") {
            res.setHeader("content-type", "text/html")
            fs.readFile("index.html", "utf-8" , (err, data) => {
                res.end(data)
            })
        }

//disponibilizando la ruta "/mailing" para hacer uso del formulario
        if (req.url.startsWith("/mailing")) {
          getIndicadores().then((r) => {
                
//Creando plantilla de información de API mindicador.cl
            const plantilla = `
<h2>Hola! Los indicadores economicos de hoy ${moment().locale("es-mx").format("LL")} son los siguientes:</h2><br> 

- El valor del <strong>Dólar</strong> el día de hoy es: <strong>$${r.dolar.toLocaleString('es')} CLP</strong><br> 
- El valor del <strong>Euro</strong> el día de hoy es: <strong>$${r.euro.toLocaleString('es')} CLP</strong><br> 
- El valor de la <strong>UF</strong> el día de hoy es: <strong>$${r.uf.toLocaleString('es')} CLP</strong><br> 
- El valor de la <strong>UTM</strong> el día de hoy es: <strong>$${r.utm.toLocaleString('es')} CLP</strong>
                        `
//Validando "," dentro del parametro "correos" y enviando a través de la función "enviar" la información hacía los correos ingresados en el formulario
            if (correos.includes(",")) {
              enviar(correos.split(","), asunto, contenido + plantilla).then((data) => {
                
//Creación de segunda plantilla para el archivo "único" como respaldo de envío del correo
                const plantilla2 = `
Fecha de Envio: ${moment().locale("es-mx").format('L')}
Correos: ${correos.split(",")}

Asunto: ${asunto}

            Contenido:

${contenido}
${plantilla}
                  `
                
// Usando File System para crear una carpeta "Correos" y dentro de ella, crear el archivo con la información del correo enviado
                fs.mkdir("./correos", () => {
                  fs.writeFile(`./correos/${uuidv4().slice(30)}.txt`, plantilla2, "utf-8" ,() => {
                      console.log("Se ha creado un archivo en la carpeta 'Correos' con la información de los correos recién enviados")
                  })

                })

//Generando y enviando respuestas al localhost:3000/mailing de éxito y error a la hora de enviar correos
                res.write(
                  `
                  <div class="alert alert-warning" role="alert">Tus correos han sido enviados! <br><a href="http://localhost:3000/" class="alert-link">Clickea para volver a hacer Spam</a>
                            `
                );
                res.end(data)
              });
            } else {
              res.end(`
                        <div class="alert alert-warning" role="alert">Oops... ha habido un error, posiblemente falto una coma al final de cada mail, incluso si es uno solo :C <br><a href="http://localhost:3000/" class="alert-link">Click aqui para Volver</a>
                        `)
            }
          })
        }

// Función asincrona que toma los datos de mindicador.cl y crea un arreglo de los valores a usar
async function getIndicadores() {
  const { data } = await axios.get("https://mindicador.cl/api");
  const dolar = data.dolar.valor;
  const euro = data.euro.valor;
  const uf = data.uf.valor;
  const utm = data.utm.valor;
  const arrInd = { dolar, euro, uf, utm };
  return arrInd;
}

    })
    .listen(3000, () => console.log("Servidor levantado en el puerto 3000"))