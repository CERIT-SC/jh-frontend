import "./Form.css";
import React, { useState, useEffect } from "react";
import ProgressiveForm from "../../src/components/Form/ProgressiveForm";
import { EinfraFooter } from "../../src/components/FooterAndHeader/EinfraFooter";
import { FieldHeader } from "../../src/components/FieldHeader/FieldHeader";
import { SliderCheckBox } from "../../src/components/SliderCheckBox/SliderCheckBox";
import { DropDownMenu } from "../../src/components/DropDownMenu/DropDownMenu";
import { TileSelector } from "../../src/components/TileSelector/TileSelector";
import JupyterHubHeader from "../../src/components/FooterAndHeader/JupyterHubHeader";
import {
  DropDownButton,
  DropDownOption,
} from "../../src/components/DropDownButton/DropDownButton";
import {
  images,
  sectionTitles,
  formImagesName,
  gpu_instance,
  defaultImagesName,
} from "../data/formData";
import { gatherFormData } from "../scripts/gatherFormData";

const StepOne = ({ setFormData, defaultFormData }) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [checkSsh, setCheckSsh] = useState(null);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(null);
  const [activeDropdownOptionIndex, setActiveDropdownOptionIndex] = useState(null);

  useEffect(() => {
    if (defaultFormData) {
      if (defaultFormData.notebookImage) {
        const text = defaultFormData.notebookImage.type;
        if (text === "customnb") {
          handleInputChange({
            target: {
              value: defaultFormData.notebookImage.selectedOption,
            },
          }, Object.entries(images).length + 1)
        } else {
          const key = Object.keys(defaultImagesName).find((key) => defaultImagesName[key] === text);
          const dindex = Object.keys(images).indexOf(key);

          const flattenedImages = Object.entries(images).flatMap(([category, options]) =>
            Object.keys(options).map((key) => ({ category, key }))
          );

          const image = defaultFormData.notebookImage.selectedOption.value.replace("cerit.io/hubs/", "");
          const index = flattenedImages.findIndex((entry) => entry.key === image);
          console.log(image, index, dindex)

          handleSelect(key, image, index, dindex);
        }
        handleSshCheck(defaultFormData.notebookImage.sshAccess);
        setCheckSsh(defaultFormData.notebookImage.sshAccess);
      }
      
    }
  }, []);

  const handleSelect = (key, image, index, dindex) => {
    setSelectedDropdownIndex(dindex);
    setActiveDropdownOptionIndex(index);
    setFormData((prev) => ({
      ...prev,
      images: key,
      [formImagesName[key]]: `cerit.io/hubs/${image}`,
    }));
  };

  const handleInputChange = (e, index) => {
    setActiveDropdownOptionIndex(null);
    setSelectedDropdownIndex(index);
    setFormData((prev) => ({
      ...prev,
      images: "custom",
      customimage: e.target.value,
    }));
  };

  const handleSshCheck = (checked) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      if (checked) {
        updatedFormData.sshCheck = "yes";
      } else {
        delete updatedFormData.sshCheck;
      }

      return updatedFormData;
    });
  };

  const isActiveIndex = (index) => {
    return activeDropdownIndex === index;
  };

  const isSelectedIndex = (index) => {
    return selectedDropdownIndex === index;
  };

  let dropDownIndex = 0;

  function extractName(url) {
    const regex = /\/hub\/spawn\/[^/]+\/([^?]*)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const extractedName = extractName(appConfig.postUrl);
  const formattedName = extractedName ? `--${extractedName}` : "";

  return (
    <div className="form-wrap">
      <h2>Choosing Image</h2>
      {Object.entries(images).map(([key, options], dropdownIndex) => (
        <DropDownButton
          key={dropdownIndex}
          isActive={isActiveIndex(dropdownIndex)}
          onActivate={() => setActiveDropdownIndex(dropdownIndex)}
          isSelected={isSelectedIndex(dropdownIndex)}
          title={sectionTitles[key]}
        >
          {Object.entries(options).map(([value, label]) => {
            const currentIndex = dropDownIndex++;
            return (
              <DropDownOption
                index={currentIndex}
                activeIndex={activeDropdownOptionIndex}
                title={label}
                onSelect={() =>
                  handleSelect(key, value, currentIndex, dropdownIndex)
                }
              />
            );
          })}
        </DropDownButton>
      ))}
      <DropDownButton
        key={Object.entries(images).length + 1}
        isActive={isActiveIndex(Object.entries(images).length + 1)}
        isSelected={isSelectedIndex(Object.entries(images).length + 1)}
        onActivate={() =>
          setActiveDropdownIndex(Object.entries(images).length + 1)
        }
        title="Custom Image"
        infoText="Provide image name in format repo/image_name:tag"
      >
        <input
          type="text"
          onChange={(e) =>
            handleInputChange(e, Object.entries(images).length + 1)
          }
          placeholder="Write image name here"
          className="custom-option"
        />
      </DropDownButton>
      <SliderCheckBox
        title="Ensure ssh access into the notebook"
        onChange={handleSshCheck}
        id="sshCheckBox"
        init={checkSsh}
      >
        Connection will be available at jovyan@jupyter&#8209;{appConfig.userName}{formattedName}&#8209;datalabs.dyn.cloud.e&#8209;infra.cz
      </SliderCheckBox>
    </div>
  );
};

const StepTwo = ({ setFormData, formData, defaultFormData }) => {
  const [checkedErased, setCheckErased] = useState(false);

  useEffect(() => {
    if (defaultFormData) {
      const checked = defaultFormData.delhome
      setCheckErased(checked)
      setFormData((prev) => {
        const updatedFormData = { ...prev };
  
        if (checked) {
          updatedFormData.delhome = "delete";
        } else {
          delete updatedFormData.delhome;
        }
  
        return updatedFormData;
      });
    }
  }, []);

  const handleErase = (checked) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      if (checked) {
        updatedFormData.delhome = "delete";
      } else {
        delete updatedFormData.delhome;
      }

      return updatedFormData;
    });
  };

  const values = {};
  const selectElement = document.getElementById("phid");

  if (selectElement !== null) {
    const options = selectElement.getElementsByTagName("option");
    for (let option of options) {
      values[option.value] = option.value;
    }
  } else {
    values["testing"] = "testing";
  }

  return (
    <div className="form-wrap">
      <h2>Choosing storage</h2>
      <FieldHeader
        title="Persistent Notebook Home"
        infoText="Persistent home means that even when notebook is deleted, the data will persist and can be used again."
      >
        <SliderCheckBox
          title="Erase if home exists"
          onChange={handleErase}
          id="phCheckId"
          init={checkedErased}
        >
          Consider thoroughly checking this option - it removes the contents of whole home directory (located at /home/jovyan/).
        </SliderCheckBox>
      </FieldHeader>
    </div>
  );
};

const StepThree = ({ setFormData, defaultFormData }) => {
  const [defMem, setDefMem] = useState(null);
  const [defCPU, setDefCPU] = useState(null);
  const [defGPU, setDefGPU] = useState(null);

  useEffect(() => {
    if (defaultFormData) {
      const mem = Number(defaultFormData.memory.value);
      const cpu = defaultFormData.cpu;
      const val = defaultFormData.gpu.value;
      const txt = defaultFormData.gpu.text;

      setFormData((prev) => ({
        ...prev,
        cpuselection: cpu,
      }));

      setFormData((prev) => ({
        ...prev,
        memselection: mem,
      }));

      setFormData((prev) => ({
        ...prev,
        gpuselection: val,
      }));

      setDefMem(mem)
      setDefCPU(cpu)
      setDefGPU([val, txt])
    }
  }, []);

  const handleCPUSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      cpuselection: value,
    }));
  };

  const handleMemSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      memselection: value,
    }));
  };

  const handleGPUSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      gpuselection: value,
    }));
  };

  return (
    <div className="form-wrap">
      {defCPU !== null && defMem !== null && defGPU !== null ? (<>
        <h2>Resources</h2>
        <p>
          The notebook is spawned only when one node fulfills <b>all</b> your
          requirements.
        </p>
        <TileSelector
          setFormData={handleCPUSelect}
          title="CPU"
          selectionText="Select CPU limit:"
          numberOptions={[1, 4, 6, 8, 10, 16, 24, 32]}
          defaultSelect={defCPU}
        ></TileSelector>
        <TileSelector
          setFormData={handleMemSelect}
          title="Memory"
          selectionText={"Select memory limit (in GB):"}
          numberOptions={[4, 8, 16, 32, 64, 128, 256]}
          defaultSelect={defMem}
        ></TileSelector>
        <FieldHeader
          title="GPU"
          infoText="We strongly advise to request a GPU part instead of whole GPU due to their limited amount. If you use whole GPU inefficiently, you might be banned from requesting it again."
        >
          <p>By default, no GPU is assigned.</p>
          <DropDownMenu
            formSelect={handleGPUSelect}
            title="Select an option"
            menuOptions={gpu_instance}
            defaultOption={defGPU}
          ></DropDownMenu>
          <p>Current GPUs Free: </p>
          <div>
            <div className="GPU-wrapper">
              <iframe
                className="GPU-stats"
                src="https://kuba-mon-int.cloud.e-infra.cz/d-solo/d3d6e47f-6365-428e-94d1-e04956349e08/gpu-types-and-usage?orgId=1&var-GPU=NVIDIA-A10&theme=light&panelId=2"
                width="200"
                height="200"
                frameborder="0"
                align="left"
              ></iframe>
              <iframe
                className="GPU-stats"
                src="https://kuba-mon-int.cloud.e-infra.cz/d-solo/d3d6e47f-6365-428e-94d1-e04956349e08/gpu-types-and-usage?orgId=1&var-GPU=NVIDIA-A40&theme=light&panelId=2"
                width="200"
                height="200"
                frameborder="0"
                align="left"
              ></iframe>
            </div>
          </div>
        </FieldHeader>
      </>) : <></>}
    </div>
  );
};

function FormPage() {

  var defaultFormData = gatherFormData();
  console.log(defaultFormData);
  if (defaultFormData === null) {
    defaultFormData = {
      "memory": { "value": "4", "text": "4" },
      "gpu": { "value": "mig-1g.10gb", "text": "10GB part A100", "migAmount": { "value": "1", "text": "1" } },
      "cpu": 1,
      "delhome": true,
      "notebookImage":
      {
        "type": "tfnb", "selectedOption":
        {
          "value": "cerit.io/hubs/tensorflowgpu:2.12.1",
          "text": "TensorFlow 2.12.1 with GPU and TensorBoard"
        },
        "sshAccess": true
      }
    }
  }

  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    memselection: 4,
    cpuselection: 1,
    gpuselection: "none",
    migamount: 1,
  });

  const submitForm = () => {
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    fetch(appConfig.postUrl, {
      method: "POST",
      body: formDataToSend,
    })
      .then((response) => {
        if (response.ok) {
          const pendingUrl = appConfig.postUrl.replace(
            "/spawn/",
            "/spawn-pending/",
          );
          window.location.href = pendingUrl;
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  };

  const steps = [
    <StepOne key={0} formData={formData} setFormData={setFormData} defaultFormData={defaultFormData} />,
    <StepTwo key={1} formData={formData} setFormData={setFormData} defaultFormData={defaultFormData} />,
    <StepThree key={2} formData={formData} setFormData={setFormData} defaultFormData={defaultFormData} />,
  ];

  return (
    <>
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <div className="wrapper">
        <ProgressiveForm
          steps={steps}
          submitForm={submitForm}
          error={error}
        ></ProgressiveForm>
        <EinfraFooter></EinfraFooter>
      </div>
    </>
  );
}

export default FormPage;
