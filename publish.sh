#!/bin/bash

# publish.sh - Script interactif pour Build & Push

echo "---------------------------------------------------"
echo "🎵 Shazylist - Outil de publication interactive"
echo "---------------------------------------------------"

# 1. Option de Build
read -p "🔨 Voulez-vous recompiler l'application et générer un nouveau DMG ? (y/n) : " build_choice
if [[ "$build_choice" =~ ^[Yy]$ ]]; then
    echo "Lancement du build..."
    ./build_dmg.sh
    
    if [ $? -ne 0 ]; then
        echo "❌ Le build a échoué. Publication annulée."
        exit 1
    fi
else
    echo "⏩ Build ignoré."
fi

echo "---------------------------------------------------"

# 2. Option de Push Git
read -p "🚀 Voulez-vous commiter et pousser les changements vers GitLab ? (y/n) : " push_choice
if [[ "$push_choice" =~ ^[Yy]$ ]]; then
    
    git status -s
    
    echo ""
    read -p "📝 Entrez le message de commit (Convention: TYPE: description) : " commit_msg
    
    if [ -z "$commit_msg" ]; then
        echo "❌ Message de commit vide. Annulation."
        exit 1
    fi
    
    git add .
    git commit -m "$commit_msg"
    
    # Récupération de la branche courante
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    echo "Envoi vers origin/$current_branch..."
    git push origin "$current_branch"
    
    echo "✅ Publication terminée avec succès !"
else
    echo "⏩ Push ignoré."
fi
