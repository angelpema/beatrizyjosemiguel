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


let valor = 0;
let desbloqueado = false;


/* ===============================
   CORAZÓN
================================ */

heartButton.addEventListener(
    "click",
    function () {

        if (desbloqueado) {
            return;
        }

        valor += 10;

        if (valor > 100) {
            valor = 100;
        }

        percentage.textContent =
            valor + "%";

        progress.style.width =
            valor + "%";


        /* Animación del corazón */

        heartButton
            .classList
            .remove("latido");

        void heartButton.offsetWidth;

        heartButton
            .classList
            .add("latido");


        /* Vibración móvil */

        if (navigator.vibrate) {

            navigator.vibrate(30);

        }


        /* Al llegar al 100% */

        if (valor === 100) {

            desbloqueado = true;

            setTimeout(
                abrirRegalo,
                700
            );

        }

    }
);


/* ===============================
   ABRIR REGALO
================================ */

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


/* ===============================
   GUARDAR MOMENTO
================================ */

saveButton.addEventListener("click", async function () {

    const pagina = document.getElementById("pagina");

    saveButton.style.display = "none";

    try {

        const canvas = await html2canvas(pagina, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f7eee6"
        });

        canvas.toBlob(async function (blob) {

            if (!blob) {
                alert("No se pudo generar la imagen.");
                return;
            }

            const archivo = new File(
                [blob],
                "nuestro-momento.png",
                { type: "image/png" }
            );

            /* ==========================
               MÓVIL: COMPARTIR / GUARDAR
            ========================== */

            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({ files: [archivo] })
            ) {

                try {

                    await navigator.share({
                        files: [archivo],
                        title: "Nuestro momento"
                    });

                } catch (error) {

                    // Si el usuario cierra el menú de compartir
                    console.log("Compartir cancelado", error);

                }

            }

            /* ==========================
               PC / NAVEGADORES COMPATIBLES
            ========================== */

            else {

                const url = URL.createObjectURL(blob);

                const enlace = document.createElement("a");

                enlace.href = url;
                enlace.download = "nuestro-momento.png";

                document.body.appendChild(enlace);

                enlace.click();

                enlace.remove();

                setTimeout(function () {
                    URL.revokeObjectURL(url);
                }, 1000);
            }

        }, "image/png");

    } catch (error) {

        console.error(error);

        alert("Ha ocurrido un error al generar la imagen.");

    } finally {

        saveButton.style.display = "inline-block";

    }

});