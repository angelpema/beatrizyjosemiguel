/* =========================================================
   ELEMENTOS
========================================================= */

const heartButton = document.getElementById("heartButton");
const percentage = document.getElementById("percentage");
const progress = document.getElementById("progress");
const contenido = document.getElementById("contenido");
const saveButton = document.getElementById("saveButton");


/* =========================================================
   VARIABLES
========================================================= */

let valor = 0;
let desbloqueado = false;

let audioContext = null;
let audioBuffer = null;
let promesaAudio = null;
let fuenteAudio = null;
let volumenAudio = null;


/* =========================================================
   PREPARAR AUDIO
========================================================= */

function prepararAudio() {

    if (promesaAudio) {
        return promesaAudio;
    }

    promesaAudio = (async function () {

        const ContextoAudio =
            window.AudioContext || window.webkitAudioContext;

        if (!ContextoAudio) {
            throw new Error("Este navegador no admite Web Audio.");
        }

        if (!audioContext) {
            audioContext = new ContextoAudio();
        }

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        if (!audioBuffer) {

            const respuesta = await fetch(
                "static/songs/cancion2.m4a"
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo cargar la canción.");
            }

            const datos = await respuesta.arrayBuffer();

            audioBuffer = await audioContext.decodeAudioData(datos);
        }

    })().catch(function (error) {

        promesaAudio = null;
        throw error;

    });

    return promesaAudio;
}


/* =========================================================
   REPRODUCIR CANCIÓN
========================================================= */

async function reproducirCancion() {

    try {

        await prepararAudio();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        if (fuenteAudio) {
            fuenteAudio.stop();
            fuenteAudio.disconnect();
        }

        if (volumenAudio) {
            volumenAudio.disconnect();
        }

        fuenteAudio = audioContext.createBufferSource();
        fuenteAudio.buffer = audioBuffer;
        fuenteAudio.loop = true;

        volumenAudio = audioContext.createGain();
        volumenAudio.gain.value = 0.8;

        fuenteAudio.connect(volumenAudio);
        volumenAudio.connect(audioContext.destination);

        fuenteAudio.start(0);

    } catch (error) {

        console.error("Error reproduciendo canción:", error);

    }

}


/* =========================================================
   CORAZÓN
========================================================= */

heartButton.addEventListener("click", function () {

    if (desbloqueado) {
        return;
    }

    /* Preparar el audio desde el toque del usuario */
    prepararAudio().catch(function (error) {
        console.error("Error preparando audio:", error);
    });

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

    /* Cerrar al pulsar fuera de la imagen */
    visor.addEventListener("click", function (evento) {

        if (evento.target === visor) {
            visor.close();
        }

    });

    /* Escape también cierra el diálogo */
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