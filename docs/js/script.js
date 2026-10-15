/* =========================================================
   ELEMENTOS
========================================================= */

const heartButton = document.getElementById("heartButton");
const percentage = document.getElementById("percentage");
const progress = document.getElementById("progress");
const contenido = document.getElementById("contenido");
const saveButton = document.getElementById("saveButton");

let valor = 0;
let desbloqueado = false;


/* =========================================================
   CANCIÓN
========================================================= */

const cancion = document.createElement("audio");

cancion.src = "static/songs/cancion2.m4a";
cancion.preload = "auto";
cancion.loop = true;
cancion.volume = 0.8;
cancion.controls = true;

cancion.setAttribute("aria-label", "Nuestra canción");

cancion.style.display = "block";
cancion.style.width = "100%";

/* Solo aparece si no se consigue reproducir la canción */
const panelAudio = document.createElement("div");

panelAudio.hidden = true;
panelAudio.style.maxWidth = "360px";
panelAudio.style.margin = "25px auto";
panelAudio.style.padding = "0 20px";
panelAudio.style.textAlign = "center";

const mensajeAudio = document.createElement("p");

mensajeAudio.setAttribute("role", "status");
mensajeAudio.style.marginBottom = "12px";
mensajeAudio.style.fontSize = "18px";

panelAudio.append(mensajeAudio, cancion);
contenido.prepend(panelAudio);

function mostrarErrorAudio(error) {

    console.error("Error de audio:", error, cancion.error);

    panelAudio.hidden = false;

    const codigo = cancion.error?.code;

    if (codigo === 2) {

        mensajeAudio.textContent =
            "No se ha podido descargar la canción. Comprueba la conexión y vuelve a intentarlo.";

    } else if (codigo === 3 || codigo === 4) {

        mensajeAudio.textContent =
            "No se ha podido abrir la canción. Comprueba que static/songs/cancion2.m4a existe y que el archivo se puede reproducir.";

    } else {

        mensajeAudio.textContent =
            "Pulsa ▶ para escuchar nuestra canción.";

    }

}

function reproducirCancion() {

    /*
       play() se ejecuta directamente dentro del clic,
       sin esperar a descargar ni decodificar el archivo.
    */

    cancion.muted = false;

    const reproduccion = cancion.play();

    if (reproduccion) {
        reproduccion.catch(mostrarErrorAudio);
    }

}

cancion.addEventListener("playing", function () {
    panelAudio.hidden = true;
});

cancion.addEventListener("error", function () {

    if (desbloqueado) {
        mostrarErrorAudio(cancion.error);
    }

});


/* =========================================================
   CORAZÓN
========================================================= */

heartButton.addEventListener("click", function () {

    /* Permite volver a intentar el audio tocando el corazón */
    if (desbloqueado) {

        if (cancion.paused) {
            reproducirCancion();
        }

        return;
    }

    valor = Math.min(valor + 10, 100);

    percentage.textContent = valor + "%";
    progress.style.width = valor + "%";

    heartButton.classList.remove("latido");

    void heartButton.offsetWidth;

    heartButton.classList.add("latido");

    if (navigator.vibrate) {
        navigator.vibrate(30);
    }

    if (valor === 100) {

        desbloqueado = true;

        /* Iniciar la música dentro del propio toque */
        reproducirCancion();

        setTimeout(abrirRegalo, 700);

    }

});


/* =========================================================
   ABRIR REGALO
========================================================= */

function abrirRegalo() {

    contenido.classList.remove("bloqueado");
    contenido.classList.add("desbloqueado");

    setTimeout(function () {

        const reducirMovimiento = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        contenido.scrollIntoView({
            behavior: reducirMovimiento ? "instant" : "smooth",
            block: "start"
        });

    }, 300);

}


/* =========================================================
   FOTOS EN GRANDE
========================================================= */

(function configurarVisorFotos() {

    const fotos = document.querySelectorAll(
        ".galeria .foto, .foto-final .marco-final"
    );

    const visor = document.createElement("dialog");

    visor.className = "visor-fotos";
    visor.setAttribute("aria-label", "Fotografía ampliada");

    const cerrar = document.createElement("button");

    cerrar.type = "button";
    cerrar.className = "visor-cerrar";
    cerrar.textContent = "×";
    cerrar.setAttribute("aria-label", "Cerrar fotografía");

    const imagenGrande = document.createElement("img");

    visor.append(cerrar, imagenGrande);
    document.body.appendChild(visor);

    let fotoAnterior = null;
    let overflowAnterior = "";

    function abrirFoto(contenedor) {

        const imagen = contenedor.querySelector("img");

        if (!imagen || visor.open) {
            return;
        }

        fotoAnterior = contenedor;

        imagenGrande.src = imagen.currentSrc || imagen.src;
        imagenGrande.alt = imagen.alt || "Fotografía ampliada";

        overflowAnterior = document.body.style.overflow;

        visor.showModal();
        document.body.style.overflow = "hidden";

        cerrar.focus();

    }

    fotos.forEach(function (foto) {

        const imagen = foto.querySelector("img");

        foto.tabIndex = 0;
        foto.setAttribute("role", "button");
        foto.setAttribute("aria-haspopup", "dialog");

        foto.setAttribute(
            "aria-label",
            "Ampliar: " + (imagen?.alt || "fotografía")
        );

        foto.addEventListener("click", function () {
            abrirFoto(foto);
        });

        foto.addEventListener("keydown", function (evento) {

            if (evento.key === "Enter" || evento.key === " ") {

                evento.preventDefault();
                abrirFoto(foto);

            }

        });

    });

    cerrar.addEventListener("click", function () {
        visor.close();
    });

    visor.addEventListener("click", function (evento) {

        if (evento.target === visor) {
            visor.close();
        }

    });

    visor.addEventListener("close", function () {

        document.body.style.overflow = overflowAnterior;

        if (fotoAnterior) {
            fotoAnterior.focus({ preventScroll: true });
        }

        imagenGrande.removeAttribute("src");

    });

})();


/* =========================================================
   GUARDAR MOMENTO
========================================================= */

if (saveButton) {

    saveButton.addEventListener("click", async function () {

        const pagina = document.getElementById("pagina");
        const displayAnterior = saveButton.style.display;

        saveButton.disabled = true;
        saveButton.style.display = "none";

        try {

            const canvas = await html2canvas(pagina, {
                scale: 1.5,
                useCORS: true,
                allowTaint: false,
                backgroundColor: "#f7eee6",
                logging: false
            });

            const imagen = canvas.toDataURL("image/jpeg", 0.92);

            mostrarImagenParaGuardar(imagen);

        } catch (error) {

            console.error("Error generando imagen:", error);

            alert("No se ha podido generar la imagen.");

        } finally {

            saveButton.style.display = displayAnterior;
            saveButton.disabled = false;

        }

    });

}


/* =========================================================
   MOSTRAR IMAGEN PARA GUARDAR
========================================================= */

function mostrarImagenParaGuardar(src) {

    const overlayAnterior = document.getElementById(
        "guardar-overlay"
    );

    if (overlayAnterior) {
        overlayAnterior.remove();
    }

    const overlay = document.createElement("div");

    overlay.id = "guardar-overlay";

    overlay.innerHTML = `
        <div class="guardar-contenido">

            <button
                id="cerrar-guardar"
                class="cerrar-guardar"
                type="button"
                aria-label="Cerrar imagen">
                ×
            </button>

            <h2>
                Tu recuerdo está listo ❤️
            </h2>

            <p>
                En iPhone mantén pulsada la imagen y selecciona
                <strong>Guardar en Fotos</strong>.
            </p>

            <img
                id="imagen-generada"
                alt="Nuestro momento"
            >

            <a
                download="nuestro-momento.jpg"
                class="boton-descargar">
                Descargar imagen
            </a>

        </div>
    `;

    overlay.querySelector("#imagen-generada").src = src;
    overlay.querySelector(".boton-descargar").href = src;

    document.body.appendChild(overlay);

    overlay.querySelector("#cerrar-guardar").addEventListener(
        "click",
        function () {
            overlay.remove();
        }
    );

}