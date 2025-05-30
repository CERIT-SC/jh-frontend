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

function getMetaCentrumHomeSelection() {
    const homeCheck = document.getElementById('homecheck');
    const metaCentrumData = {
        enabled: homeCheck && homeCheck.checked,
        selectedHome: null,
        mountToStorage: null
    };

    if (homeCheck && homeCheck.checked) {
        const homeSelect = document.getElementById('homeselection');
        if (homeSelect) {
            metaCentrumData.selectedHome = {
                value: homeSelect.value,
                text: homeSelect.options[homeSelect.selectedIndex].text
            };
        }
        const locationStorageCheck = document.getElementById('locationstoragemount');
        metaCentrumData.mountToStorage = locationStorageCheck && locationStorageCheck.checked;
    }
    return metaCentrumData;
}

function getProjectSelection() {
    const projectCheck = document.getElementById('projectselection');
    const projectData = projectCheck && projectCheck.checked

    return projectData;
}

function getPersistentHomeSelection() {
    const checkedHomeRadio = document.querySelector('input[name="phselection"]:checked');
    if (checkedHomeRadio) {
        const persistentHomeData = { type: checkedHomeRadio.value };

        if (checkedHomeRadio.value === 'new') {
            const phomeCheck = document.getElementById('phomecheck');
            persistentHomeData.eraseIfExists = phomeCheck && phomeCheck.checked;
        } else if (checkedHomeRadio.value === 'existing') {
            const persistentHomeSelect = document.getElementById('phid');
            if (persistentHomeSelect) {
                persistentHomeData.selectedHome = {
                    value: persistentHomeSelect.value,
                    text: persistentHomeSelect.options[persistentHomeSelect.selectedIndex].text
                };
            }
        }
        return persistentHomeData;
    }
    return null;
}

function getS3StorageSelection() {
    const checkedS3 = document.getElementById('s3check')

    const s3data = {
        enabled: checkedS3 && checkedS3.checked
    }

    if (checkedS3 && checkedS3.checked) {
        const s3TypeField = document.getElementById('ss3id')
        // const s3TypeField = document.querySelector('input[name="s3selection"]:checked');
        if (s3TypeField) {
            s3data.type = s3TypeField.value;
            if (s3TypeField.value === "new") {
                s3data.news3 = {
                    s3Url : document.getElementById('s3url').value,
                    s3Bucket : document.getElementById('s3bucket').value,
                    s3AccessKey : document.getElementById('s3accesskey').value,
                    s3SecretKey : document.getElementById('s3secretkey').value,
                }
            } else if (s3TypeField.value === "existing") {
                const s3ExistingPvcField = document.getElementById("s3id")
                if (s3ExistingPvcField) {
                    s3data.existings3 = {
                        value: s3ExistingPvcField.value,
                        text: s3ExistingPvcField.options[s3ExistingPvcField.selectedIndex].text
                    }
                }
            }
        }
        return s3data;
    }

    return null;
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
            foldingnb: 'foldingnblistselection',
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
        metaCentrumHome: getMetaCentrumHomeSelection(),
        projectDirectories: getProjectSelection(),
        persistentHome: getPersistentHomeSelection(),
        s3Storage: getS3StorageSelection(),
        notebookImage: getNotebookImageSelection(),
        sshName: document.getElementById('sshname').value,
    };
    console.log('defaultFormData:', formData);

    const allEmpty = Object.values(formData).every(isEmpty);

    return allEmpty ? null : formData;
}

