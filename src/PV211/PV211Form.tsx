import ProgressiveForm from "../stories/ProgressiveForm";
import { EinfraFooter } from "../stories/EinfraFooter";
import WarningMassage from "../stories/WarningMassage";
import { FieldHeader } from "../stories/FieldHeader";
import { SliderCheckBox } from "../stories/SliderCheckBox";
import { DropDownMenu } from "../stories/DropDownMenu";
import { FormButton } from "../stories/FormButton";
import { DropDownButton, DropDownOption } from "../stories/DropDownButton";
import { TileSelector } from "../stories/TileSelector";
import React, { useState } from "react";

const StepTwo = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleErase = (checked) => {
    setFormData((prev) => ({
      ...prev,
      erase_home: checked,
    }));
  };

  return (
    <div className="form-wrap">
      <h2>Home</h2>
      <FieldHeader
        title="Persistent Notebook Home"
        infoText="Persistent home means that even when notebook is deleted, the data will persist and can be used again."
      >
        <SliderCheckBox
          title="Erase if home exists"
          onChange={handleErase}
        ></SliderCheckBox>
        <div>
          Mounted to
          <code>/home/jovyan</code>
        </div>
      </FieldHeader>
      <div className="btns_wrap">
        <FormButton style="Next" onClickFun={nextStep}></FormButton>
      </div>
    </div>
  );
};

const StepThree = ({ formData, setFormData, prevStep, submitForm }) => {
  const handleCPUSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      cpus: value,
    }));
  };

  const handleMemSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      memory: value,
    }));
  };

  const handleGPUSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      GPU: value,
    }));
  };

  const gpu_instance = [
    "None",
    "10GB part of NVIDIA A100 GPU",
    "20GB part of NVIDIA A100 GPU",
    "NVIDIA A10 GPU (20GB)",
    "NVIDIA A40 GPU (40GB)",
    "NVIDIA A100 GPU (80GB)",
    "Any whole NVIDIA GPU",
  ];

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
        ></DropDownMenu>
        <p>Current GPUs Free: </p>
        <div>
          <div className="GPU-wrapper">
            <iframe
              className="GPU-stats"
              src="https://grafana.cerit-sc.cz/d-solo/ddu8n0k6vf8jke/gpus-for-jupyterhub?orgId=1&from=1723613691871&to=1723635291871&theme=light&panelId=7"
              height={100}
            ></iframe>
            <iframe
              className="GPU-stats"
              src="https://grafana.cerit-sc.cz/d-solo/ddu8n0k6vf8jke/gpus-for-jupyterhub?orgId=1&from=1723613586753&to=1723635186753&theme=light&panelId=8"
              height={100}
            ></iframe>
          </div>
        </div>
      </FieldHeader>
      <div className="btns_wrap">
        <FormButton style="Back" onClickFun={prevStep}></FormButton>
        <FormButton style="Submit" onClickFun={submitForm}></FormButton>
      </div>
    </div>
  );
};

function PV211Form() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    memory: 0,
    cpus: 0,
    erase_home: false,
    GPU: "",
  });

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  const submitForm = () => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("_xsrf="))
      ?.split("=")[1];

    const formDataEncoded = new URLSearchParams();

    formDataEncoded.append("_xsrf", cookieValue);

    Object.keys(formData).forEach((key) => {
      formDataEncoded.append(key, formData[key]);
    });

    fetch("/hub/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formDataEncoded.toString(),
    });
  };

  const steps = [
    <StepTwo
      formData={formData}
      setFormData={setFormData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <StepThree
      formData={formData}
      setFormData={setFormData}
      prevStep={prevStep}
      submitForm={submitForm}
    />,
  ];

  return (
    <div className="App">
      <WarningMassage style={"warning"}>
        <p>
          {" "}
          JupyterHub is currently undergoing scheduled maintenance. We apologize
          for any inconvenience this may cause. The service will be back online
          shortly. Thank you for your patience.{" "}
        </p>
      </WarningMassage>
      <WarningMassage style={"new"}>
        <p>
          We added GPT support. Check out our{" "}
          <a href="https://www.example.com">website</a> for more details.
        </p>
      </WarningMassage>
      <ProgressiveForm step={step} steps={steps}></ProgressiveForm>
      <EinfraFooter></EinfraFooter>
    </div>
  );
}

export default PV211Form;
