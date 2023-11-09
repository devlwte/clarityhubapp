/*********************************************
* Desarrollador: DevLwte                     *
* Versión: 1.0                               *
* Fecha de Creación: 06/11/2023              *
**********************************************

/*********************************************
**                                          **
** ¡ALERTA!                                 **
** Esta versión de la biblioteca solo       **
** es compatible con elementos únicos.      **
** Asegúrate de utilizar elementos únicos   **
** para registrar combinaciones de teclas.  **
**                                          **
*********************************************/


var KeyCombinations = (function () {
    var keyBindings = {};

    function registerKeyCombination(selector, combinations, callback) {
        var normalizedCombinations = normalizeCombinations(combinations);
        keyBindings[selector] = keyBindings[selector] || {};
        keyBindings[selector][normalizedCombinations] = callback;
    }

    function normalizeCombinations(combinations) {
        return combinations
            .toLowerCase()
            .split('+')
            .sort()
            .join('+');
    }

    function handleKeyPress(event) {
        var key = event.key.toLowerCase();
        var modifiers = '';

        if (event.ctrlKey) modifiers += 'ctrl+';
        if (event.altKey) modifiers += 'alt+';
        if (event.shiftKey) modifiers += 'shift+';

        var combination = normalizeCombinations(modifiers + key);

        // Verificar si existe una combinación registrada para el elemento activo
        var activeElement = document.activeElement;

        for (var selector in keyBindings) {
            if (selector === 'document' && keyBindings[selector][combination]) {
                keyBindings[selector][combination](event);
                return;
            } else if (activeElement.matches(selector) && keyBindings[selector][combination]) {
                keyBindings[selector][combination](event);
                return;
            }
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    return {
        register: function (selector, combinations, callback) {
            registerKeyCombination(selector, combinations, callback);
        }
    };
})();
