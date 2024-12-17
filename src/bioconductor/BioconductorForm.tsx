import ProgressiveForm from "../stories/ProgressiveForm";
import { EinfraFooter } from "../stories/EinfraFooter";
import WarningMassage from "../stories/WarningMassage";
import { FieldHeader } from "../stories/FieldHeader";
import { SliderCheckBox } from "../stories/SliderCheckBox";
import { DropDownButton, DropDownOption } from "../stories/DropDownButton";
import { TileSelector } from "../stories/TileSelector";
import React, { useState } from "react";

const StepOne = ({ formData, setFormData, nextStep }) => {
  const handleSelect = (image, index) => {
    setActiveDropdownOptionIndex(index);
    setFormData((prev) => ({
      ...prev,
      image: image,
    }));
  };

  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [activeDropdownOptionIndex, setActiveDropdownOptionIndex] =
    useState(null);

  const isActiveIndex = (index) => {
    return activeDropdownIndex === index;
  };

  return (
    <div className="form-wrap">
      <h2>Choosing Image</h2>
      <DropDownButton
        key={0}
        isActive={isActiveIndex(0)}
        onActivate={() => setActiveDropdownIndex(0)}
        title="Select an Image"
      >
        <DropDownOption
          title="Bioconductor Jupyter"
          index={0}
          activeIndex={activeDropdownOptionIndex}
          onSelect={handleSelect}
        ></DropDownOption>
        <DropDownOption
          title="Rstudio with R 4.3.1"
          index={1}
          activeIndex={activeDropdownOptionIndex}
          onSelect={handleSelect}
        ></DropDownOption>
      </DropDownButton>
      <div className="btns_wrap">
        <FormButton style="Next" onClickFun={nextStep}></FormButton>
      </div>
    </div>
  );
};

const StepTwo = ({ formData, setFormData, nextStep, prevStep }) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);

  const handleStorage = (storage) => {
    setFormData((prev) => ({
      ...prev,
      storage: storage,
    }));
  };

  const handleCheckboxDirectories = (checked) => {
    setFormData((prev) => ({
      ...prev,
      directories: checked,
    }));
  };

  const handlePersistentNewSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      persistent: value,
    }));
  };

  const selectOptionsStorage = [
    "brno12-cerit",
    "brno11-elixir",
    "brno14-ceitec",
    "brno2",
    "budejovice1",
    "du-cesnet",
    "liberec3-tul",
    "plzen1",
    "plzen4-ntis",
    "praha1",
    "praha2-natur",
    "praha5-elixir",
    "praha6-fzu",
    "pruhonice1-ibot",
    "vestec1-elixir",
  ];

  return (
    <div className="form-wrap">
      <h2>Home</h2>
      <FieldHeader
        title="Persistent Notebook Home"
        infoText="Persistent home means that even when notebook is deleted, the data will persist and can be used again."
      >
        <SliderCheckBox title="Erase if home exists"></SliderCheckBox>
        <div>
          Mounted to
          <code>/home/jovyan</code>
        </div>
      </FieldHeader>
      <div className="btns_wrap">
        <FormButton style="Back" onClickFun={prevStep}></FormButton>
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
      <div className="btns_wrap">
        <FormButton style="Back" onClickFun={prevStep}></FormButton>
        <FormButton style="Submit" onClickFun={submitForm}></FormButton>
      </div>
    </div>
  );
};

function BioconductorForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    image: "",
    memory: 0,
    cpus: 0,
    storage: "",
    persistent: "",
    directories: false,
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
    <StepOne
      key={0}
      formData={formData}
      setFormData={setFormData}
      nextStep={nextStep}
    />,
    <StepTwo
      key={1}
      formData={formData}
      setFormData={setFormData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <StepThree
      key={2}
      formData={formData}
      setFormData={setFormData}
      prevStep={prevStep}
      submitForm={submitForm}
    />,
  ];

  return (
    <div className="App">
      <WarningMassage
        style={"warning"}
        text="JupyterHub is currently undergoing scheduled maintenance. We apologize for any inconvenience this may cause. The service will be back online shortly. Thank you for your patience."
      ></WarningMassage>
      <ProgressiveForm step={step} steps={steps}></ProgressiveForm>
      <EinfraFooter></EinfraFooter>
    </div>
  );
}

export default BioconductorForm;
