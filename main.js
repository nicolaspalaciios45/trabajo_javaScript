/*let nombre = "nicolas"
let apellido = "cabrera"
let edad = "28 años"
let cuidad = "cordoba capital"
let numero = 123
 console.log("hola mi nombre es " + nombre + " " + apellido + ", tengo " + edad + ", vivo en " + cuidad + " y mi numero favorito es el " + numero)

alert=(nombre)
let numero1= prompt("ingresa el primer numero")
let numero2=15
alert(numero1+numero2)

let nombre=prompt("como se llama?")
const año= 1997;

let edad= number (prompt("que edad tenes?"))s

let nombre =  prompt("nicolas")  
let apellido =  "cabrera"
let edad = prompt"15 años"
let ciudad = "cordoba capital"

if (edad >= 18){
    console.log("sos mayor de edad");
}
else {
    console.log("sos menor de edad");
}
let edad =Number(prompt("ingresa tu edad"));
if (edad >= 18){
    alert("sos mayor de edad");
}else {
    alert("sos menor de edad");
}   */
    

/*let edad = 0;

while (edad < 18) {
  edad = Number(prompt("Ingresá tu edad"));

  if (edad < 18) {
    alert("Sos menor de edad. Intentá de nuevo");
  }
}

alert("Sos mayor de edad. Bienvenido");

let nombre= "nicolas";
while (nombre != "nicolas" && nombre != "Nicolas") 
    nombre = (prompt("ingresa tu nombre"));
if (nombre != "nicolas" && nombre != "Nicolas") {
    alert("nombre incorrecto, intenta de nuevo");
}*/
  
//pedir nombre del clientes 
let nombre = prompt("Bienvenidos a la licorería Apolo. Ingrese su nombre:");
// Validar nombre
while (!isNaN(nombre) || nombre === "") {
    alert("❌ Debe ingresar un nombre válido (solo letras).");
    nombre = prompt("Por favor, ingrese su nombre nuevamente:");
}
alert("Hola " + nombre + " gracias por visitar nuestra licorería");
console.log("Cliente:", nombre);
//pedir edad del cliente
let edad = Number(prompt("Por favor, ingrese su edad:"));

//verificar si es mayor de edad
if (isNaN(edad)) {
    alert("Bienvenidos, eres mayor de edad...");
}
 else if (edad < 18) {
    alert("Lo siento, debes ser mayor de edad para realizar compras en nuestra licorería.");
}
while (isNaN(edad) || edad < 18) {
    alert("Lo siento, eres menor de edad o ingresaste un valor no válido. No puedes comprar.");
    edad = Number(prompt("Por favor, ingrese su edad nuevamente:"));
}
   alert("Bienvenidos, eres mayor de edad. Puedes realizar compras en nuestra licorería.");
console.log("Edad:", edad);

    // LISTA DE PRODUCTOS (ordenada con saltos de línea)
const menu =
  "🍾 PRODUCTOS DISPONIBLES 🍾\n\n" +
  "1 - Vino tinto   $500\n" +
  "2 - Vino blanco  $600\n" +
  "3 - Cerveza      $300\n" +
  "4 - Whisky       $20000\n" +
  "5 - Ron          $15000\n" +
  "6 - Tequila      $10000\n" +
  "7 - Fernet       $19000\n\n" +
  "0 - Finalizar compra";

alert(menu);

// CARRITO
let carrito = [];
let total = 0;

let entrada = prompt(
  "Ingresa los códigos separados por coma.\n" +
  "Ejemplo: 1,3,7\n\n" +
  "1 Vino tinto $500\n2 Vino blanco $600\n3 Cerveza $300\n4 Whisky $20000\n5 Ron $15000\n6 Tequila $10000\n7 Fernet $19000"
);

let codigos = entrada.split(",");

for (let i = 0; i < codigos.length; i++) {
  let producto = Number(codigos[i].trim());

  if (isNaN(producto)) {
    alert("❌ Código inválido: " + codigos[i]);
    continue;
  }

  switch (producto) {
    case 1:
      carrito.push("Vino tinto");
      total += 500;
      break;
    case 2:
      carrito.push("Vino blanco");
      total += 600;
      break;
    case 3:
      carrito.push("Cerveza");
      total += 300;
      break;
    case 4:
      carrito.push("Whisky");
      total += 20000;
      break;
    case 5:
      carrito.push("Ron");
      total += 15000;
      break;
    case 6:
      carrito.push("Tequila");
      total += 10000;
      break;
    case 7:
      carrito.push("Fernet");
      total += 19000;
      break;
    default:
      alert("❌ Código inválido: " + producto);
  }
}
console.log("Carrito:", carrito);
console.log("Total:", total);
// RESUMEN DE COMPRA
alert(
  "🧾 RESUMEN\n" +
  "Productos: " + carrito.join(", ") + "\n" +
  "Total: $" + total
);

// PAGAR O CANCELAR
  let pagar = prompt("¿Deseas pagar? (si / no)").toLowerCase();

  if (pagar === "si") {
    alert("✅ Pago realizado con éxito. ¡Gracias por tu compra!");
  } else {
    alert("❌ Compra cancelada. No se realizó el pago.");
  }

  