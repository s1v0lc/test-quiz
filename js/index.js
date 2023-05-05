/*******************************************************************************
    Sauvegarde et récupération des données (localStorage)
*******************************************************************************/
// [CODE LOCALSTORAGE]
// La variable historique qu'on mettra à jour durant le quiz.
// Initialement, elle aura la valeur retournée par recupererHistorique()
let historique = recupererHistorique();

/**
 * Récupère et retourne le tableau de l'historique de quiz de localStorage
 * s'il y en a un (retourne un tableau vide sinon.)
 * @returns {Array} Tableau contenant l'historique du jeu (réponses au quiz)
 */
function recupererHistorique() {
    // On vérifie s'il y a un historique dans localStorage
    let historiqueChaine = localStorage.getItem("super-quiz-historique");
    // On retourne l'historique décodé en JS ou un tableau vide
    let historiqueTableau = JSON.parse(historiqueChaine) || [];
    return historiqueTableau;
}

/*///////////////////////////////////////////////////////////////////////
                     LES VARIABLES DU QUIZ
///////////////////////////////////////////////////////////////////////*/

//Variables du quiz
let noQuestion = 0; //Le no de la prochaine question

//La section du quiz et sa position sur l'axe des X
let laSection = document.querySelector("section");
let positionX = 100;
//Les balises pour afficher les titres des questions et les choix de
let titreQuestion = document.querySelector(".titre-question");
let lesChoixDeReponses = document.querySelector(".les-choix-de-reponse");

/*///////////////////////////////////////////////////////////////////////
                            DÉBUT DU QUIZ
///////////////////////////////////////////////////////////////////////*/

//Gérer la fin de l'animation d'intro
let titreIntro = document.querySelector(".anim-titre-intro");
//Gestionnaire d'événement pour détecter la fin de l'animation d'intro
titreIntro.addEventListener("animationend", afficherConsignePourDebuterLeJeu);

/*///////////////////////////////////////////////////////////////////////
                            LES FONCTIONS
///////////////////////////////////////////////////////////////////////*/

/**
 * Fonction pour afficher les consignes pour débuter le jeu
 *
 * @param {Event} event : objet AnimationEvent de l'événement distribué
 */
function afficherConsignePourDebuterLeJeu(event) {
    //console.log(event.animationName);
    //On affiche la consigne si c'est la fin de la deuxième animation: etirer-mot
    if (event.animationName == "etirer-mot") {
        //On affiche un message dans le pied de page
        let piedDePage = document.querySelector("footer");
        piedDePage.innerHTML = "<h1>Cliquer dans l'écran pour commencer le quiz</h1>";

        //On met un écouteur sur la fenêtre pour enlever l'intro et commencer le quiz
        window.addEventListener("click", commencerLeQuiz);
    }
}

/**
 * Fonction pour enlever les éléments de l'intro et commencer le quiz
 *
 */
function commencerLeQuiz() {
    // [CODE LOCALSTORAGE]
    // Nouvelle partie : on consigne dans la variable historique en créant
    // et initialisant un nouvel objet dans le tableau historique.
    // (date formatée, et un tableau des réponses vide pour le moment)
    historique.push(
        {
            date: new Date().toLocaleDateString('fr-ca'),
            reponses: []
        }
    );

    // Modifier la valeur stockée dans localStorage
    localStorage.setItem("super-quiz-historique", JSON.stringify(historique));

    //On enlève le conteneur de l'intro
    let intro = document.querySelector("main.intro");
    intro.remove();

    //On enlève l'écouteur qui gère le début du quiz
    window.removeEventListener("click", commencerLeQuiz);

    //On met le conteneur du quiz visible
    document.querySelector(".quiz").style.display = "flex";

    //On affiche la première question
    afficherQuestion();
}

/**
 * Fonction permettant d'afficher chaque question
 *
 */
function afficherQuestion() {
    //Récupérer l'objet de la question en cours
    let objetQuestion = lesQuestions[noQuestion];
    //console.log(objetQuestion);

    //On affiche le titre de la question
    titreQuestion.innerText = objetQuestion.titre;

    //On crée et on affiche les balises des choix de réponse
    //Mais d'abord on enlève le contenu actuel
    lesChoixDeReponses.innerHTML = "";

    let unChoix;
    for (let i = 0; i < objetQuestion.choix.length; i++) {
        //On crée la balise et on y affecte une classe CSS
        unChoix = document.createElement("div");
        unChoix.classList.add("choix");
        //On intègre la valeur du choix de réponse
        unChoix.innerText = objetQuestion.choix[i];

        //On affecte dynamiquement l'index de chaque choix
        unChoix.indexChoix = i;

        //On met un écouteur pour vérifier la réponse choisie
        unChoix.addEventListener("mousedown", verifierReponse);

        //Enfin on affiche ce choix
        lesChoixDeReponses.append(unChoix);
    }

    //Modifier la valeur de la position de la section sur l'axe des X
    //pour son animation
    positionX = 100;

    //Partir la première requête pour l'animation de la section
    requestAnimationFrame(animerSection);
}

/**
 * Fonction permettant d'animer l'arrivée de la section
 *
 */
function animerSection() {
    //On décrémente la position de 2
    positionX -= 2;
    laSection.style.transform = `translateX(${positionX}vw)`;

    //On part une autre requête  d'animation si la position n'est pas atteinte
    if (positionX > 0) {
        requestAnimationFrame(animerSection);
    }
}

/**
 * Fonction permettant de vérifier la réponse choisie et de gérer la suite
 *
 * @param {object} event Informations sur l'événement MouseEvent distribué
 */
function verifierReponse(event) {
    // [CODE LOCALSTORAGE]
    // On modifie l'historique pour ajouter ce choix dans le tableau des réponses
    // Remarquer qu'il faut modifier uniquement le dernier objet du tableau
    // historique.
    historique[historique.length-1].reponses.push(event.target.indexChoix);

    // On sauvegarde le nouvel historique dans localStorage.
    localStorage.setItem("super-quiz-historique", JSON.stringify(historique));

    //Plusieurs choses peuvent être effectuées ici, mais pour l'instant
    //on va uniquement afficher la prochaine question
    gererProchaineQuestion();
}

/**
 * Fonction permettant de gérer l'affichage de la prochaine question
 *
 */
function gererProchaineQuestion() {
    //On incrémente lnoQuestion pour la  prochaine question à afficher
    noQuestion++;

    //S'il reste une question on l'affiche, sinon c'est la fin du jeu...
    if (noQuestion < lesQuestions.length) {
        //On affiche la prochaine question
        afficherQuestion();
    } else {
        //C'est la fin du quiz
        afficherFinQuiz();
    }
}

/**
 * Fonction permettant d'afficher l'interface de la fin du jeu
 *
 */
function afficherFinQuiz() {
    let zoneFinQuiz = document.querySelector(".fin");
    //On enlève le quiz de l'affichage et on affiche la fin du jeu
    document.querySelector(".quiz").style.display = "none";
    zoneFinQuiz.style.display = "flex";

    // [CODE LOCALSTORAGE]
    // Obtenir la dernière version sauvegardée de l'historique
    historique;
    let nombreParties;
    zoneFinQuiz.innerHTML = `<p>Nombre de partie(s) jouée(s) : </p>`;
    zoneFinQuiz.innerHTML += `<p>Liste des réponses à toutes les parties jouées : </p>`;
    for (let partie of historique) {
        zoneFinQuiz.innerHTML += `<p>Date : ${partie.date} / Réponses : ${partie.reponses} </p>`;
    }
}
