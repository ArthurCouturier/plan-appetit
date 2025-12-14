#!/bin/bash

# Script pour corriger les icônes avec canal alpha
# Usage: ./fix-app-icon-alpha.sh

echo "🔍 Recherche des icônes d'application avec canal alpha..."

# Chemin vers le dossier AppIcon
APPICON_PATH="ios/App/App/Assets.xcassets/AppIcon.appiconset"

if [ ! -d "$APPICON_PATH" ]; then
    echo "❌ Dossier AppIcon introuvable: $APPICON_PATH"
    exit 1
fi

cd "$APPICON_PATH" || exit

# Trouver toutes les images PNG
for img in *.png; do
    if [ -f "$img" ]; then
        # Vérifier si l'image a un canal alpha
        if sips -g hasAlpha "$img" | grep -q "hasAlpha: yes"; then
            echo "⚠️  Image avec alpha détectée: $img"
            
            # Créer un backup
            cp "$img" "${img}.backup"
            echo "   💾 Backup créé: ${img}.backup"
            
            # Supprimer le canal alpha en ajoutant un fond blanc
            sips -s format png "$img" --out "$img.temp"
            
            # Créer une image avec fond blanc
            sips -s format png \
                 --setProperty formatOptions normal \
                 --deleteColorManagementProperties \
                 "$img.temp" --out "$img"
            
            rm "$img.temp"
            
            echo "   ✅ Canal alpha supprimé: $img"
        else
            echo "✅ OK: $img (pas de canal alpha)"
        fi
    fi
done

echo ""
echo "🎉 Traitement terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifiez visuellement vos icônes dans Xcode"
echo "2. Si tout est OK, supprimez les backups: rm ios/App/App/Assets.xcassets/AppIcon.appiconset/*.backup"
echo "3. Recommencez votre archive pour TestFlight"
