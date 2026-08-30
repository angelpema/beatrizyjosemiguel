/* =========================================================
   ELEMENTOS
========================================================= */

const heartButton =
    document.getElementById("heartButton");

const percentage =
    document.getElementById("percentage");

const progress =
    document.getElementById("progress");

const contenido =
    document.getElementById("contenido");

const saveButton =
    document.getElementById("saveButton");

const cancion =
    document.getElementById("cancion");


/* =========================================================
   VARIABLES
========================================================= */

let valor = 0;
let desbloqueado = false;
let audioPreparado = false;


/* =========================================================
   CORAZÓN
========================================================= */

heartButton.addEventListener("click", function () {

    /* =====================================================
       PREPARAR AUDIO PARA IPHONE
       Safari necesita que play() ocurra tras un toque
    ===================================================== */

    if (!audioPreparado) {

        cancion.volume = 0;

        const promesaAudio = cancion.play();

        if (promesaAudio !== undefined) {

            promesaAudio
                .then(function () {

                    cancion.pause();

                    cancion.currentTime = 0;

                    cancion.volume = 0.7;

                    audioPreparado = true;

                    console.log(
                        "Audio preparado correctamente"
                    );

                })
                .catch(function (error) {

                    console.log(
                        "No se pudo preparar el audio:",
                        error
                    );

                });

        }

    }


    /* =====================================================
       SI YA ESTÁ DESBLOQUEADO NO HACER NADA MÁS
    ===================================================== */

    if (desbloqueado) {
        return;
    }


    /* =====================================================
       AUMENTAR PORCENTAJE
    ===================================================== */

    valor += 10;

    if (valor > 100) {
        valor = 100;
    }


    percentage.textContent =
        valor + "%";

    progress.style.width =
        valor + "%";


    /* =====================================================
       ANIMACIÓN DEL CORAZÓN
    ===================================================== */

    heartButton
        .classList
        .remove("latido");

    void heartButton.offsetWidth;

    heartButton
        .classList
        .add("latido");


    /* =====================================================
       VIBRACIÓN
    ===================================================== */

    if (navigator.vibrate) {

        navigator.vibrate(30);

    }


    /* =====================================================
       CUANDO LLEGUE AL 100 %
    ===================================================== */

    if (valor === 100) {

        desbloqueado = true;


        /* =============================================
           REPRODUCIR CANCIÓN
        ============================================= */

        cancion.currentTime = 0;

        cancion.volume = 0.7;


        const reproduccion =
            cancion.play();


        if (reproduccion !== undefined) {

            reproduccion
                .then(function () {

                    console.log(
                        "Canción reproduciéndose"
                    );

                })
                .catch(function (error) {

                    console.log(
                        "No se pudo reproducir la canción:",
                        error
                    );

                });

        }


        /* =============================================
           ABRIR REGALO
        ============================================= */

        setTimeout(
            abrirRegalo,
            700
        );

    }

});


/* =========================================================
   ABRIR REGALO
========================================================= */

function abrirRegalo() {

    contenido
        .classList
        .remove("bloqueado");

    contenido
        .classList
        .add("desbloqueado");


    setTimeout(
        function () {

            contenido.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        300
    );

}


/* =========================================================
   GUARDAR MOMENTO
========================================================= */

if (saveButton) {

    saveButton.addEventListener(
        "click",
        async function () {

            const pagina =
                document.getElementById("pagina");


            saveButton.style.display =
                "none";


            try {

                const canvas =
                    await html2canvas(
                        pagina,
                        {
                            scale: 1.5,
                            useCORS: true,
                            allowTaint: false,
                            backgroundColor: "#f7eee6",
                            logging: false
                        }
                    );


                const imagen =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.92
                    );


                mostrarImagenParaGuardar(
                    imagen
                );


            } catch (error) {

                console.error(
                    "Error generando imagen:",
                    error
                );


                alert(
                    "No se ha podido generar la imagen."
                );

            }


            saveButton.style.display =
                "inline-block";

        }
    );

}


/* =========================================================
   MOSTRAR IMAGEN PARA GUARDAR EN IPHONE
========================================================= */

function mostrarImagenParaGuardar(src) {

    const overlay =
        document.createElement("div");


    overlay.id =
        "guardar-overlay";


    overlay.innerHTML = `

        <div class="guardar-contenido">

            <button
                id="cerrar-guardar"
                class="cerrar-guardar"
                type="button">
                ×
            </button>


            <h2>
                Tu recuerdo está listo ❤️
            </h2>


            <p>
                En iPhone mantén pulsada
                la imagen y selecciona
                <strong>Guardar en Fotos</strong>.
            </p>


            <img
                src="${src}"
                id="imagen-generada"
                alt="Nuestro momento"
            >


            <a
                href="${src}"
                download="nuestro-momento.jpg"
                class="boton-descargar">

                Descargar imagen

            </a>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    document
        .getElementById("cerrar-guardar")
        .addEventListener(
            "click",
            function () {

                overlay.remove();

            }
        );

}