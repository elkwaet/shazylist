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
    
    echo "Envoi vers public/$current_branch..."
    git push public "$current_branch"
    
    echo "✅ Publication terminée avec succès !"
else
    echo "⏩ Push ignoré."
fi

echo "---------------------------------------------------"

# 3. Option de Release GitHub
read -p "📦 Voulez-vous créer une Release sur GitHub avec l'installateur ? (y/n) : " release_choice
if [[ "$release_choice" =~ ^[Yy]$ ]]; then
    
    if [ ! -f "Shazylist-Installer.dmg" ]; then
        echo "❌ Fichier Shazylist-Installer.dmg introuvable. Veuillez recompiler l'application d'abord."
    else
        # Suggestion intelligente du prochain tag
        latest_tag=$(git describe --tags --abbrev=0 2>/dev/null)
        if [ -z "$latest_tag" ]; then
            suggested_tag="v1.0.0"
        else
            prefix=${latest_tag%.*}
            suffix=${latest_tag##*.}
            if [[ "$suffix" =~ ^[0-9]+$ ]]; then
                next_suffix=$((suffix + 1))
                suggested_tag="${prefix}.${next_suffix}"
            else
                suggested_tag="${latest_tag}-new"
            fi
        fi
        
        read -p "🏷️ Entrez le nom du tag de la release [$suggested_tag] : " input_tag
        tag_name=${input_tag:-$suggested_tag}
        
        if [ -z "$tag_name" ]; then
            echo "❌ Tag vide. Annulation de la release."
        else
            echo "🤐 Compression du DMG en ZIP (pour compatibilité maximale)..."
            zip -q Shazylist-Installer.zip Shazylist-Installer.dmg
            
            echo "🚀 Création de la release $tag_name sur GitHub..."
            # On s'assure que le tag est poussé d'abord
            git tag "$tag_name"
            git push public "$tag_name"
            
            # Création de la release avec le CLI GitHub
            gh release create "$tag_name" Shazylist-Installer.zip --title "Shazylist $tag_name" --notes "Nouvelle version $tag_name de Shazylist."
            
            if [ $? -eq 0 ]; then
                echo "✅ Release $tag_name publiée avec succès sur GitHub !"
                # Nettoyage du zip local
                rm Shazylist-Installer.zip
            else
                echo "❌ Échec de la création de la release via le CLI GitHub."
            fi
        fi
    fi
else
    echo "⏩ Création de release ignorée."
fi

