// ================================================
// PROYECTO FINAL: Fundas Guru - Ecommerce JS
// Funcionalidades:
// - Carga de productos desde JSON externo (async)
// - Carrito de compras con localStorage
// - Modal con slider de imágenes
// - Cotización USD en tiempo real (fetch API)
// - Notificaciones con SweetAlert2
// ================================================

// ================================================
// TOGGLE MENÚ HAMBURGUESA
// ================================================
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

// ================================================
// ASINCRONISMO: Cotización USD desde API externa
// ================================================
async function obtenerCambioUSD() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) throw new Error("Error al obtener cotización");
    const data = await res.json();
    const ars = data.rates.ARS;
    const el = document.getElementById("cotizacion");
    if (el) el.innerText = `💵 USD 1 = $${Math.round(ars).toLocaleString("es-AR")} ARS`;
  } catch (e) {
    console.warn("No se pudo obtener cotización:", e.message);
  }
}

// ================================================
// ASINCRONISMO: Carga de productos desde JSON
// ================================================
async function cargarProductos() {
  try {
    const res = await fetch("productos.json");
    if (!res.ok) throw new Error("No se pudo cargar productos.json");
    const productos = await res.json();
    return productos;
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los productos.",
    });
    return [];
  }
}

// ================================================
// RENDERIZAR PRODUCTOS EN EL HTML DINÁMICAMENTE
// ================================================
function renderizarProductos(productos) {
  const contenedor = document.querySelector(".productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  productos.forEach((p) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.dataset.categoria = p.categoria || "";
    div.innerHTML = `
      <div class="img-wrap">
        <img src="${p.img}" alt="${p.nombre}">
      </div>
      <h3>${p.nombre}</h3>
      <p class="precio">$${p.precio.toLocaleString("es-AR")}</p>
      <button class="btn-add"
        data-nombre="${p.nombre}"
        data-precio="${p.precio}"
        data-img="${p.img}"
        data-imgs="${p.imgs}">
        Agregar al carrito
      </button>
    `;
    contenedor.appendChild(div);
  });
}

// ================================================
// INICIO: DOMContentLoaded
// ================================================
document.addEventListener("DOMContentLoaded", async () => {

  // Llamadas asíncronas al cargar
  await obtenerCambioUSD();
  const productos = await cargarProductos();
  renderizarProductos(productos);

  // ================================================
  // CARRITO
  // ================================================
  const KEY = "carrito_fundas_guru";
  let carrito = JSON.parse(localStorage.getItem(KEY)) || [];

  const btnCarrito = document.getElementById("btnCarrito");
  const panel = document.getElementById("carritoPanel");
  const cerrarCarrito = document.getElementById("cerrarCarrito");
  const itemsBox = document.getElementById("carritoItems");
  const totalBox = document.getElementById("carritoTotal");
  const countBox = document.getElementById("carritoCount");
  const btnVaciar = document.getElementById("btnVaciar");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnComprar = document.getElementById("btnComprar");

  // Guardar carrito en localStorage
  function guardar() {
    localStorage.setItem(KEY, JSON.stringify(carrito));
  }

  // Formatear precio en pesos argentinos
  function money(n) {
    return "$" + n.toLocaleString("es-AR");
  }

  // Actualizar vista del carrito
  function actualizar() {
    if (!itemsBox) return;

    if (countBox) countBox.innerText = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    if (totalBox) totalBox.innerText = money(total);

    if (carrito.length === 0) {
      itemsBox.innerHTML = "<p>Tu carrito está vacío.</p>";
      return;
    }

    itemsBox.innerHTML = carrito.map((p, i) => `
      <div class="item">
        <img src="${p.img}" alt="">
        <div class="info">
          <strong>${p.nombre}</strong>
          <span>${money(p.precio)}</span>
        </div>
        <div class="controles">
          <button onclick="restar(${i})">-</button>
          <span>${p.cantidad}</span>
          <button onclick="sumar(${i})">+</button>
          <button onclick="eliminar(${i})">🗑</button>
        </div>
      </div>
    `).join("");
  }

  // Agregar producto al carrito (delegación de eventos)
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-add")) return;
    e.stopPropagation();

    const btn = e.target;
    const nombre = btn.dataset.nombre;
    const precio = Number(btn.dataset.precio);
    const img = btn.dataset.img;

    const existente = carrito.find(p => p.nombre === nombre);
    if (existente) existente.cantidad += 1;
    else carrito.push({ nombre, precio, img, cantidad: 1 });

    guardar();
    actualizar();
    if (panel) panel.classList.add("open");

    // Notificación con SweetAlert2
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `${nombre} agregado al carrito`,
      showConfirmButton: false,
      timer: 1500,
    });
  });

  // Funciones globales del carrito
  window.sumar = function(i) {
    carrito[i].cantidad++;
    guardar();
    actualizar();
  };

  window.restar = function(i) {
    carrito[i].cantidad--;
    if (carrito[i].cantidad <= 0) carrito.splice(i, 1);
    guardar();
    actualizar();
  };

  window.eliminar = function(i) {
    carrito.splice(i, 1);
    guardar();
    actualizar();
  };

  if (btnVaciar) btnVaciar.addEventListener("click", () => {
    Swal.fire({
      title: "¿Vaciar carrito?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        carrito = [];
        guardar();
        actualizar();
      }
    });
  });

  if (btnCancelar) btnCancelar.addEventListener("click", () => {
    carrito = [];
    guardar();
    actualizar();
    panel.classList.remove("open");
  });

  if (btnComprar) btnComprar.addEventListener("click", () => {
    if (carrito.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrito vacío", text: "Agregá productos antes de comprar." });
      return;
    }
    abrirCheckout();
  });

  // ================================================
  // CHECKOUT FLOW
  // ================================================
  const checkoutOverlay = document.getElementById("checkoutOverlay");
  let ckPaso = 1;
  let ckMetodoPago = "transferencia";

  function abrirCheckout() {
    ckPaso = 1;
    ckMostrarPaso(1);
    checkoutOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  window.cerrarCheckout = function () {
    checkoutOverlay.classList.remove("show");
    document.body.style.overflow = "";
    // Resetear formulario
    ["ckNombre","ckApellido","ckEmail","ckDireccion","ckLocalidad","ckProvincia","ckCP","ckCardNum","ckCardNombre","ckCardExp","ckCardCvv"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const comprobante = document.getElementById("ckComprobante");
    if (comprobante) comprobante.value = "";
    const horarioSel = document.getElementById("ckHorario");
    if (horarioSel) horarioSel.selectedIndex = 0;
    actualizarPreviewTarjeta();
  };

  function ckMostrarPaso(n) {
    [1, 2, 3, 4].forEach(i => {
      const step = document.getElementById(`ckStep${i}`);
      if (step) step.classList.toggle("hidden", i !== n);
      const dot = document.getElementById(`ckDot${i}`);
      if (dot) {
        dot.classList.toggle("active", i === n);
        dot.classList.toggle("done", i < n);
      }
      const line = document.getElementById(`ckLine${i}`);
      if (line) line.classList.toggle("done", i < n);
    });
    ckPaso = n;
  }

  function ckValidarPaso(paso) {
    if (paso === 1) {
      const nombre = document.getElementById("ckNombre").value.trim();
      const apellido = document.getElementById("ckApellido").value.trim();
      const email = document.getElementById("ckEmail").value.trim();
      if (!nombre || !apellido) {
        Swal.fire({ icon: "warning", title: "Campos requeridos", text: "Completá nombre y apellido." });
        return false;
      }
      if (!email || !email.includes("@") || !email.includes(".")) {
        Swal.fire({ icon: "warning", title: "Email inválido", text: "Ingresá un email válido." });
        return false;
      }
    }
    if (paso === 2) {
      const dir = document.getElementById("ckDireccion").value.trim();
      const localidad = document.getElementById("ckLocalidad").value.trim();
      const provincia = document.getElementById("ckProvincia").value.trim();
      const cp = document.getElementById("ckCP").value.trim();
      const horario = document.getElementById("ckHorario").value;
      if (!dir || !localidad || !provincia || !cp) {
        Swal.fire({ icon: "warning", title: "Campos requeridos", text: "Completá todos los campos de envío." });
        return false;
      }
      if (!horario) {
        Swal.fire({ icon: "warning", title: "Horario requerido", text: "Seleccioná un horario de entrega." });
        return false;
      }
    }
    if (paso === 3 && ckMetodoPago === "tarjeta") {
      const num = document.getElementById("ckCardNum").value.replace(/\s/g, "");
      const nombre = document.getElementById("ckCardNombre").value.trim();
      const exp = document.getElementById("ckCardExp").value.trim();
      const cvv = document.getElementById("ckCardCvv").value.trim();
      if (num.length < 16 || !nombre || exp.length < 5 || cvv.length < 3) {
        Swal.fire({ icon: "warning", title: "Tarjeta incompleta", text: "Completá todos los datos de la tarjeta." });
        return false;
      }
    }
    return true;
  }

  window.irPaso = function (n) {
    if (n > ckPaso && !ckValidarPaso(ckPaso)) return;
    ckMostrarPaso(n);
  };

  window.seleccionarPago = function (tipo, el) {
    ckMetodoPago = tipo;
    document.querySelectorAll(".ck-pay-tab").forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("ckPagoTransferencia").classList.toggle("hidden", tipo !== "transferencia");
    document.getElementById("ckPagoTarjeta").classList.toggle("hidden", tipo !== "tarjeta");
  };

  window.confirmarCompra = function () {
    if (!ckValidarPaso(3)) return;

    const nombre = document.getElementById("ckNombre").value.trim();
    const apellido = document.getElementById("ckApellido").value.trim();
    const email = document.getElementById("ckEmail").value.trim();
    const dir = document.getElementById("ckDireccion").value.trim();
    const localidad = document.getElementById("ckLocalidad").value.trim();
    const provincia = document.getElementById("ckProvincia").value.trim();
    const cp = document.getElementById("ckCP").value.trim();
    const horario = document.getElementById("ckHorario").value;
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const pagoLabel = ckMetodoPago === "transferencia" ? "Transferencia bancaria" : "Tarjeta de débito/crédito";

    const itemsHTML = carrito.map(p =>
      `<div style="display:flex;justify-content:space-between"><span>${p.nombre} x${p.cantidad}</span><span>${money(p.precio * p.cantidad)}</span></div>`
    ).join("");

    document.getElementById("ckResumen").innerHTML = `
      <p><strong>Cliente:</strong> ${nombre} ${apellido}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Dirección:</strong> ${dir}, ${localidad}, ${provincia} (CP ${cp})</p>
      <p><strong>Horario de entrega:</strong> ${horario}</p>
      <p><strong>Método de pago:</strong> ${pagoLabel}</p>
      <hr/>
      ${itemsHTML}
      <hr/>
      <p class="ck-resumen-total">Total: ${money(total)}</p>
    `;

    ckMostrarPaso(4);

    carrito = [];
    guardar();
    actualizar();
    if (panel) panel.classList.remove("open");
  };

  // Formateo automático tarjeta
  const ckCardNumInput = document.getElementById("ckCardNum");
  if (ckCardNumInput) {
    ckCardNumInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").substring(0, 16);
      e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
      const display = document.getElementById("ckCardNumDisplay");
      if (display) {
        const padded = v.padEnd(16, "•");
        display.textContent = padded.replace(/(.{4})/g, "$1 ").trim();
      }
    });
  }

  const ckCardExpInput = document.getElementById("ckCardExp");
  if (ckCardExpInput) {
    ckCardExpInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").substring(0, 4);
      if (v.length >= 3) v = v.substring(0, 2) + "/" + v.substring(2);
      e.target.value = v;
      const display = document.getElementById("ckCardExpDisplay");
      if (display) display.textContent = v || "MM/AA";
    });
  }

  const ckCardNombreInput = document.getElementById("ckCardNombre");
  if (ckCardNombreInput) {
    ckCardNombreInput.addEventListener("input", (e) => {
      const display = document.getElementById("ckCardNameDisplay");
      if (display) display.textContent = e.target.value.toUpperCase() || "NOMBRE APELLIDO";
    });
  }

  function actualizarPreviewTarjeta() {
    const nd = document.getElementById("ckCardNumDisplay");
    const ed = document.getElementById("ckCardExpDisplay");
    const nm = document.getElementById("ckCardNameDisplay");
    if (nd) nd.textContent = "•••• •••• •••• ••••";
    if (ed) ed.textContent = "MM/AA";
    if (nm) nm.textContent = "NOMBRE APELLIDO";
  }

  if (btnCarrito) btnCarrito.addEventListener("click", () => panel.classList.add("open"));
  if (cerrarCarrito) cerrarCarrito.addEventListener("click", () => panel.classList.remove("open"));

  actualizar();

  // ================================================
  // BUSCADOR + FILTROS DE PRODUCTOS
  // ================================================
  const buscador = document.getElementById("buscadorProductos");
  const sinResultados = document.getElementById("sinResultados");
  let filtroActivo = "todos";

  function aplicarFiltros() {
    const termino = buscador ? buscador.value.toLowerCase().trim() : "";
    const cards = document.querySelectorAll(".producto");
    let visibles = 0;

    cards.forEach((card) => {
      const nombre = card.querySelector("h3")?.innerText.toLowerCase() || "";
      const categoria = card.dataset.categoria || "";
      const coincideBusqueda = nombre.includes(termino);
      const coincideFiltro = filtroActivo === "todos" || categoria === filtroActivo;

      const mostrar = coincideBusqueda && coincideFiltro;
      card.style.display = mostrar ? "" : "none";
      if (mostrar) visibles++;
    });

    if (sinResultados) sinResultados.style.display = visibles === 0 ? "block" : "none";
  }

  if (buscador) {
    buscador.addEventListener("input", aplicarFiltros);
  }

  document.querySelectorAll(".filtro-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtroActivo = btn.dataset.filtro;
      aplicarFiltros();
    });
  });


});
