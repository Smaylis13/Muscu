# Programme muscu

Calendrier de mon programme de musculation, pensé pour le téléphone.

## Fonctionnalités

- Calendrier mensuel du lundi au vendredi
- Aperçu des exercices directement dans chaque case
- Clic sur un jour : vue agrandie avec la liste des exercices
- Bouton **Modifier** (ou **Ajouter un programme**) pour changer le programme du jour
- Swipe gauche/droite pour changer de mois
- Export du mois en image PNG avec le bouton **Exporter**
- Mode clair et sombre automatique

## Utilisation

1. Ouvrir la page : https://TON-PSEUDO.github.io/muscu/
2. Toucher un jour pour voir son programme.
3. Toucher **Modifier** et saisir un exercice par ligne, par exemple `Développé couché 4x8 80 kg`.
4. Toucher **Enregistrer**.

## Données

Les programmes sont enregistrés dans le navigateur (localStorage) :

- ils restent après un rechargement de la page ;
- ils ne sont pas partagés entre appareils ou navigateurs ;
- ils sont perdus si on vide les données du navigateur : pense à exporter en PNG pour garder une trace.

## Technique

Un seul fichier `index.html`, sans dépendance ni build. Il suffit de l’héberger (GitHub Pages) ou de l’ouvrir dans un navigateur.
