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
    div.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
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

  const numero = "549TU_NUMERO"; // <-- reemplazá con tu número real

  // Llamadas asíncronas al cargar
  await obtenerCambioUSD();
  const productos = await cargarProductos();
  renderizarProductos(productos);

  // ================================================
  // MODAL + SLIDER
  // ================================================
  const modal = document.getElementById("modal");
  const cerrar = document.getElementById("cerrar");
  const modalTitulo = document.getElementById("modalTitulo");
  const modalPrecio = document.getElementById("modalPrecio");
  const prevImg = document.getElementById("prevImg");
  const nextImg = document.getElementById("nextImg");
  const dotsBox = document.getElementById("dots");
  const track = document.getElementById("sliderTrack");

  let imagenesActuales = [];
  let indexImg = 0;

  function renderSlider() {
    if (!track) return;
    track.innerHTML = imagenesActuales.map(src => `<img src="${src}" alt="">`).join("");
    moverSlider();
    renderDots();
  }

  function moverSlider() {
    if (!track) return;
    track.style.transform = `translateX(-${indexImg * 100}%)`;
  }

  function renderDots() {
    if (!dotsBox) return;
    dotsBox.innerHTML = "";
    imagenesActuales.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "dot" + (i === indexImg ? " active" : "");
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        indexImg = i;
        moverSlider();
        renderDots();
      });
      dotsBox.appendChild(d);
    });
  }

  function cambiarImg(dir) {
    if (imagenesActuales.length <= 1) return;
    indexImg += dir;
    if (indexImg < 0) indexImg = imagenesActuales.length - 1;
    if (indexImg >= imagenesActuales.length) indexImg = 0;
    moverSlider();
    renderDots();
  }

  if (prevImg) prevImg.addEventListener("click", (e) => { e.stopPropagation(); cambiarImg(-1); });
  if (nextImg) nextImg.addEventListener("click", (e) => { e.stopPropagation(); cambiarImg(1); });

  document.addEventListener("keydown", (e) => {
    if (!modal || !modal.classList.contains("show")) return;
    if (e.key === "ArrowLeft") cambiarImg(-1);
    if (e.key === "ArrowRight") cambiarImg(1);
    if (e.key === "Escape") modal.classList.remove("show");
  });

  const sliderViewport = document.querySelector(".slider-viewport");
  let startX = 0, endX = 0;

  if (sliderViewport) {
    sliderViewport.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    sliderViewport.addEventListener("touchmove", (e) => { endX = e.touches[0].clientX; }, { passive: true });
    sliderViewport.addEventListener("touchend", () => {
      const diff = endX - startX;
      if (Math.abs(diff) < 40) return;
      cambiarImg(diff < 0 ? 1 : -1);
      startX = 0; endX = 0;
    });
  }

  // Delegación de eventos para productos renderizados dinámicamente
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".producto");
    if (!card) return;
    if (e.target.classList.contains("btn-add")) return;

    const titulo = card.querySelector("h3")?.innerText || "";
    const precio = card.querySelector(".precio")?.innerText || "";
    const btn = card.querySelector(".btn-add");
    const imgDefault = card.querySelector("img")?.getAttribute("src") || "";
    const dataImgs = btn?.dataset.imgs;

    if (modalTitulo) modalTitulo.innerText = titulo;
    if (modalPrecio) modalPrecio.innerText = precio;

    imagenesActuales = dataImgs ? dataImgs.split(",").map(s => s.trim()) : [imgDefault];
    indexImg = 0;
    renderSlider();
    if (modal) modal.classList.add("show");
  });

  if (cerrar) cerrar.addEventListener("click", () => modal.classList.remove("show"));
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

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
    const resumen = carrito.map(p => `• ${p.nombre} x${p.cantidad} = ${money(p.precio * p.cantidad)}`).join("\n");
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const mensaje = `Hola! Quiero comprar:\n${resumen}\n\nTotal: ${money(total)}`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank");
  });

  if (btnCarrito) btnCarrito.addEventListener("click", () => panel.classList.add("open"));
  if (cerrarCarrito) cerrarCarrito.addEventListener("click", () => panel.classList.remove("open"));

  actualizar();

  // ================================================
  // VISOR EXTRA (ZOOM EN IMAGEN)
  // ================================================
  const visor = document.getElementById("visorImagen");
  const imagenGrande = document.getElementById("imagenGrande");
  const cerrarVisor = document.getElementById("cerrarVisor");

  if (visor && imagenGrande && cerrarVisor) {
    document.addEventListener("click", (e) => {
      if (!e.target.matches(".producto img")) return;
      e.stopPropagation();
      imagenGrande.src = e.target.src;
      visor.style.display = "flex";
    });
    cerrarVisor.addEventListener("click", () => visor.style.display = "none");
    visor.addEventListener("click", (e) => { if (e.target === visor) visor.style.display = "none"; });
  }

});
