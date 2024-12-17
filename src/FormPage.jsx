import "./Form.css";
import ProgressiveForm from "./components/Form/ProgressiveForm";
import { EinfraFooter } from "./components/FooterAndHeader/EinfraFooter";
import { FieldHeader } from "./components/FieldHeader/FieldHeader";
import { SliderCheckBox } from "./components/SliderCheckBox/SliderCheckBox";
import { DropDownMenu } from "./components/DropDownMenu/DropDownMenu";
import {
  DropDownButton,
  DropDownOption,
} from "./components/DropDownButton/DropDownButton";
import { TileSelector } from "./components/TileSelector/TileSelector";
import React, { useState } from "react";
import {
  selectOptionsStorage,
  images,
  sectionTitles,
  formImagesName,
  gpu_instance,
} from "./data/formData";
import JupyterHubHeader from "./components/FooterAndHeader/JupyterHubHeader";
import WarningMassage from "./components/AnouncmentMessage/AnouncmentMessage";

const StepOne = ({ setFormData }) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(null);
  const [activeDropdownOptionIndex, setActiveDropdownOptionIndex] =
    useState(null);

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
      >
        Connection will be available at jovyan@jupyter-{appConfig.userName}
        {formattedName}.dyn.cloud.e-infra.cz
      </SliderCheckBox>
    </div>
  );
};

const StepTwo = ({ setFormData, formData }) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);

  const handleStorage = (storage) => {
    setFormData((prev) => ({
      ...prev,
      home: storage,
    }));
  };

  const handlePersistentHome = (val) => {
    setFormData((prev) => ({
      ...prev,
      phname: val,
    }));
  };

  const handleStorageCheck = (checked) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      if (checked) {
        updatedFormData.storageCheck = "yes";
      } else {
        delete updatedFormData.storageCheck;
      }

      return updatedFormData;
    });
  };

  const handleCheckboxDirectories = (checked) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      if (checked) {
        updatedFormData.projectCheck = "yes";
      } else {
        delete updatedFormData.projectCheck;
      }

      return updatedFormData;
    });
  };

  const handleErase = (checked) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      if (checked) {
        updatedFormData.phCheck = "yes";
      } else {
        delete updatedFormData.phCheck;
      }

      return updatedFormData;
    });
  };

  const handlePersistentNewSelect = (index) => {
    setActiveDropdownIndex(index);
    setFormData((prev) => ({
      ...prev,
      phselection: "new",
    }));
  };

  const handleExisting = (index) => {
    setActiveDropdownIndex(index);
    setFormData((prev) => ({
      ...prev,
      phselection: false,
    }));
  };

  const handleLocationStorageCheck = (checked) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      if (checked) {
        updatedFormData.locationStorageCheck = "yes";
      } else {
        delete updatedFormData.locationStorageCheck;
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
        <DropDownButton
          key={0}
          isActive={activeDropdownIndex === 0}
          onActivate={() => handlePersistentNewSelect(0)}
          primary={false}
          title="New"
        >
          <SliderCheckBox
            title="Erase if home exists"
            onChange={handleErase}
          ></SliderCheckBox>
          <div>
            Mounted to
            <code>/home/jovyan</code>
          </div>
        </DropDownButton>
        <DropDownButton
          key={1}
          isActive={activeDropdownIndex === 1}
          onActivate={() => {
            handleExisting(1);
          }}
          primary={false}
          title="Existing"
        >
          <div>
            Mounted to
            <code>/home/jovyan</code>
          </div>
          <DropDownMenu
            formSelect={handlePersistentHome}
            title="Select Persistent Home"
            menuOptions={values}
          ></DropDownMenu>
        </DropDownButton>
      </FieldHeader>
      <FieldHeader title="MetaCentrum Storage">
        <SliderCheckBox
          title="Mount MetaCentrum storage"
          onChange={handleStorageCheck}
        >
          <p>
            Mounted to <code>/home/meta/username </code>{" "}
          </p>
          <DropDownMenu
            formSelect={handleStorage}
            title="Select MetaCentrum Storage"
            menuOptions={selectOptionsStorage}
          ></DropDownMenu>
          <SliderCheckBox
            title={`Mount selected home to /storage/${formData["home"] === undefined ? "chosen_storage" : formData["home"]}/home/${appConfig.userName}`}
            onChange={handleLocationStorageCheck}
          ></SliderCheckBox>
        </SliderCheckBox>

        <SliderCheckBox
          onChange={handleCheckboxDirectories}
          title="Mount project directories"
        >
          <p>
            All projects mounted to /home/projects/brno12, specific projects are
            subfolders of that path
          </p>
        </SliderCheckBox>
      </FieldHeader>
    </div>
  );
};

const StepThree = ({ setFormData }) => {
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
      ></TileSelector>
      <TileSelector
        setFormData={handleMemSelect}
        title="Memory"
        selectionText={"Select memory limit (in GB):"}
        numberOptions={[4, 8, 16, 32, 64, 128, 256]}
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
          defaultOption={Object.entries(gpu_instance)[0]}
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
            <iframe
              className="GPU-stats"
              src="https://kuba-mon-int.cloud.e-infra.cz/d-solo/d3d6e47f-6365-428e-94d1-e04956349e08/gpu-types-and-usage?orgId=1&var-GPU=NVIDIA-A100-80GB-PCIe&theme=light&panelId=3"
              width="200"
              height="200"
              frameborder="0"
              align="left"
            ></iframe>
            <iframe
              className="GPU-stats"
              src="https://kuba-mon-int.cloud.e-infra.cz/d-solo/d3d6e47f-6365-428e-94d1-e04956349e08/gpu-types-and-usage?orgId=1&var-GPU=NVIDIA-H100-NVL&theme=light&panelId=2"
              width="200"
              height="200"
              frameborder="0"
              align="left"
            ></iframe>
            <iframe
              className="GPU-stats"
              src="https://kuba-mon-int.cloud.e-infra.cz/d-solo/d3d6e47f-6365-428e-94d1-e04956349e08/gpu-types-and-usage?orgId=1&var-GPU=NVIDIA-H100-PCIe&theme=light&panelId=2"
              width="200"
              height="200"
              frameborder="0"
              align="left"
            ></iframe>
            <iframe
              className="GPU-stats"
              src="https://kuba-mon-int.cloud.e-infra.cz/d-solo/H5q_43FVk/jupyterhub?orgId=1&theme=light&panelId=50"
              width="200"
              height="200"
              frameborder="0"
              align="left"
            ></iframe>
          </div>
        </div>
      </FieldHeader>
      <FieldHeader
        title="Resource Usage"
        infoText="This information is for your awareness, showing the estimated cost of running your notebooks, but no payment is required."
      >
        <div className="GPU-wrapper">
          <iframe
            src={`https://kuba-mon-int.cloud.e-infra.cz/d-solo/dhl1ujXSz/jupyterhub-personal?orgId=1&from=now-90d&to=now&var-name=${appConfig.userName}&panelId=3&theme=light`}
            width="300"
            height="200"
            frameborder="0"
          ></iframe>
          <iframe
            src={`https://kuba-mon-int.cloud.e-infra.cz/d-solo/dhl1ujXSz/jupyterhub-personal?orgId=1&from=now-90d&to=now&var-name=${appConfig.userName}&panelId=4&theme=light`}
            width="300"
            height="200"
            frameborder="0"
          ></iframe>
        </div>
      </FieldHeader>
    </div>
  );
};

function FormPage() {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    memselection: 4,
    cpuselection: 1,
    gpuselection: "none",
    migamount: 1,
  });

  const submitForm = () => {
    const requiredFields = {
      images: "Image",
      phselection: "Persistent Notebook Home",
    };

    const missingFields = Object.keys(requiredFields)
      .filter((key) => formData[key] === undefined)
      .map((key) => requiredFields[key]);

    if (missingFields.length > 0) {
      setError(`Please select the following: ${missingFields.join(", ")}`);
      return;
    }

    setError("");

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
    <StepOne key={0} formData={formData} setFormData={setFormData} />,
    <StepTwo key={1} formData={formData} setFormData={setFormData} />,
    <StepThree key={2} formData={formData} setFormData={setFormData} />,
  ];

  return (
    <>
      <WarningMassage style="new">
        <ul>
          <li>
            We added GPT support into the Minimal notebook, for more info see{" "}
            <a href="https://docs-ng.cerit.io/en/web-apps/jupyterhub#ai-gpt-support">
              our documentation.
            </a>
          </li>
          <li>
            It is possible to connect to the running notebook via SSH, for more
            info see{" "}
            <a href="https://docs.cerit.io/en/web-apps/jupyterhub#notebook-ssh-access">
              our documentation.
            </a>
          </li>
          <li>
            We integrated VS Code into Minimal notebook. Choose below{" "}
            <b>Simple Jupyter images</b> and{" "}
            <b>Minimal NB with Integrated VS Code</b> to try it. After startup,
            click on VS Code icon. It is possible to upload/download files using
            this option.
          </li>
          <li>
            Checkout resource utilisation (GPU, CPU, Memory) in{" "}
            <a href="https://grafana.hub.cloud.e-infra.cz/d/H5q_43FVk/jupyterhub">
              grafana
            </a>
            . Click on <b>Sign in with e-INFRA CZ</b> to log in.
          </li>
        </ul>
      </WarningMassage>
      <WarningMassage style="warning">
        <h2> Scheduled maintenance and reboot on 16th - 18th Dec 2024 </h2>
        <p>
          {" "}
          We will have scheduled maintenance and cluster reboot between 16th and
          17th of December 2024. All running notebooks will be interrupted and
          have to be started again.{" "}
        </p>
      </WarningMassage>
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
