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

(function ($) {
    var keyBindings = {};

    // Registra una combinación de teclas
    function registerKeyCombination(selector, combinations, callback) {
        var normalizedCombinations = normalizeCombinations(combinations);

        if (selector === document) {
            // Registrar la combinación a nivel de documento
            keyBindings['document'] = keyBindings['document'] || {};
            keyBindings['document'][normalizedCombinations] = callback;
        }

        if (selector instanceof Element) {
            // Registrar la combinación para un selector específico (Element)
            var selectorKey = selector.id || selector.className;
            if (selectorKey) {
                keyBindings[selectorKey] = keyBindings[selectorKey] || {};
                keyBindings[selectorKey]["element"] = selector.id ? `#${selector.id}` : `.${selector.className}`;
                keyBindings[selectorKey][normalizedCombinations] = callback;
            }
        }
    }

    // Normaliza combinaciones para garantizar que tengan un formato específico
    function normalizeCombinations(combinations) {
        return combinations
            .toLowerCase()
            .split('+')
            .sort()
            .join('+');
    }

    // Maneja eventos de presión de teclas
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
            } else if (activeElement.matches(keyBindings[selector].element) && keyBindings[selector][combination]) {
                keyBindings[selector][combination](event);
                return;
            }
        }
    }

    // Registra un manejador de eventos para el documento
    $(document).on('keydown', handleKeyPress);

    // Extiende jQuery para permitir el registro de combinaciones de teclas
    $.fn.registerKeyCombination = function (combinations, callback) {
        return this.each(function () {
            registerKeyCombination(this, combinations, callback);
        });
    };
})(jQuery);
