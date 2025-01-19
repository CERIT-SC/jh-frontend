import "./Form.css";
import React, { useState, useEffect } from "react";
import ProgressiveForm from "../../src/components/Form/ProgressiveForm";
import { EinfraFooter } from "../../src/components/FooterAndHeader/EinfraFooter";
import { FieldHeader } from "../../src/components/FieldHeader/FieldHeader";
import { SliderCheckBox } from "../../src/components/SliderCheckBox/SliderCheckBox";
import { TileSelector } from "../../src/components/TileSelector/TileSelector";
import JupyterHubHeader from "../../src/components/FooterAndHeader/JupyterHubHeader";
import {
  DropDownButton,
  DropDownOption,
} from "../../src/components/DropDownButton/DropDownButton";
import {
  images,
  sectionTitles,
} from "../data/formData";

const StepOne = ({ setFormData }) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(null);
  const [activeDropdownOptionIndex, setActiveDropdownOptionIndex] = useState(null);

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

  const handleSelect = (key, image, index, dindex) => {
    setSelectedDropdownIndex(dindex);
    setActiveDropdownOptionIndex(index);
    setFormData((prev) => ({
      ...prev,
      dockerimage: image,
    }));
  };

  const isActiveIndex = (index) => {
    return activeDropdownIndex === index;
  };

  const isSelectedIndex = (index) => {
    return selectedDropdownIndex === index;
  };

  let dropDownIndex = 0;

  return (
    <div className="form-wrap">
      <h2>Choosing Image</h2>
      {Object.entries(images).map(([key, options], dropdownIndex) => (
        <DropDownButton
          key={dropdownIndex}
          isActive={true}
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
      <h2>Choosing storage</h2>
      <FieldHeader
        title="Persistent Notebook Home"
        infoText="Persistent home means that even when notebook is deleted, the data will persist and can be used again."
      >
        <SliderCheckBox
          title="Erase if home exists"
          onChange={handleErase}
          id="phCheckId"
        > Take care of checking this button, it removes whole home directory and previous data will be lost. Use in case only when notebook is broken so it does not start, in other cases, remove data from terminal. </SliderCheckBox>
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
        numberOptions={[4, 8, 12, 16, 32, 64]}
      ></TileSelector>
    </div>
  );
};

function FormPage() {

  const [formData, setFormData] = useState({
    memselection: 4,
    cpuselection: 1,
    dockerimage: "cerit.io/hubs/rstudio:4.3.1-snakemake",
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
    <StepOne key={0} formData={formData} setFormData={setFormData} />,
    <StepThree key={1} formData={formData} setFormData={setFormData} />,
  ];

  return (
    <>
      <JupyterHubHeader userName={appConfig.userName}></JupyterHubHeader>
      <div className="wrapper">
        <ProgressiveForm
          steps={steps}
          submitForm={submitForm}
        ></ProgressiveForm>
        <EinfraFooter></EinfraFooter>
      </div>
    </>
  );
}

export default FormPage;
