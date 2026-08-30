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

saveButton.addEventListener(
    "click",
    async function () {

        const pagina =
            document.getElementById("pagina");

        saveButton.style.display =
            "none";


        const canvas =
            await html2canvas(
                pagina,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#f7eee6"
                }
            );


        saveButton.style.display =
            "inline-block";


        const enlace =
            document.createElement("a");

        enlace.download =
            "nuestro-momento.png";

        enlace.href =
            canvas.toDataURL("image/png");

        enlace.click();

    }
);