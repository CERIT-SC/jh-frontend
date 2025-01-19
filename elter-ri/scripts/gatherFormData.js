function getMemorySelection() {
    const memSelect = document.getElementById('memselection');
    if (memSelect) {
        return {
            value: memSelect.value,
            text: memSelect.options[memSelect.selectedIndex].text
        };
    }
    return null;
}

function getGpuSelection() {
    const gpuSelect = document.getElementById('gpuid');
    if (gpuSelect) {
        const gpuData = {
            value: gpuSelect.value,
            text: gpuSelect.options[gpuSelect.selectedIndex].text
        };

        if (gpuSelect.value.startsWith('mig')) {
            const migAmountSelect = document.getElementById('migamountselection');
            gpuData.migAmount = migAmountSelect
                ? {
                    value: migAmountSelect.value,
                    text: migAmountSelect.options[migAmountSelect.selectedIndex].text
                }
                : null;
        }
        return gpuData;
    }
    return null;
}

function getCpuSelection() {
    const cpuInput = document.getElementById('cpuinput');
    if (cpuInput) {
        const cpuValue = parseInt(cpuInput.value, 10);
        return cpuValue >= 1 && cpuValue <= 32 ? cpuValue : 'Out of range';
    }
    return null;
}

function getPersistentHomeSelection() {
    const delhome = document.getElementById('delhome');
    const delhomeData = delhome && delhome.checked

    return delhomeData;
}

function getNotebookImageSelection() {
    const checkedRadio = document.querySelector('input[name="images"]:checked');
    const notebookImageData = { type: null, selectedOption: null, sshAccess: null };

    if (checkedRadio) {
        notebookImageData.type = checkedRadio.id;
        const selectMap = {
            simplenb: 'simplenblistselection',
            rnb: 'rnblistselection',
            tfnb: 'tfnblistselection',
            matlabnb: 'matlabnblistselection',
            variousnb: 'variousnblistselection',
            customnb: 'customimage'
        };
        const selectId = selectMap[checkedRadio.id];
        if (selectId) {
            if (selectId === 'customimage') {
                const customInput = document.getElementById(selectId);
                if (customInput) {
                    notebookImageData.selectedOption = customInput.value;
                }
            } else {
                const selectElement = document.getElementById(selectId);
                if (selectElement) {
                    notebookImageData.selectedOption = {
                        value: selectElement.value,
                        text: selectElement.options[selectElement.selectedIndex].text
                    };
                }
            }
        }
    }
    const sshCheckbox = document.getElementById('sshaccess');
    notebookImageData.sshAccess = sshCheckbox && sshCheckbox.checked;
    return notebookImageData;
}

function isEmpty(value) {
    if (value == null) {
      return true;
    }
    if (typeof value === "object" && !Array.isArray(value)) {
      return Object.values(value).every(isEmpty);
    }
    return false;
  }

export function gatherFormData() {
    const formData = {
        memory: getMemorySelection(),
        gpu: getGpuSelection(),
        cpu: getCpuSelection(),
        delhome: getPersistentHomeSelection(),
        notebookImage: getNotebookImageSelection()
    };

    const allEmpty = Object.values(formData).every(isEmpty);

    return allEmpty ? null : formData;
}

