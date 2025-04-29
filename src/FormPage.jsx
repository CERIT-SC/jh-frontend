import "./Form.css";
import React, { useState, useEffect } from "react";
import ProgressiveForm from "./components/Form/ProgressiveForm";
import { EinfraFooter } from "./components/FooterAndHeader/EinfraFooter";
import { FieldHeader } from "./components/FieldHeader/FieldHeader";
import { SliderCheckBox } from "./components/SliderCheckBox/SliderCheckBox";
import { DropDownMenu } from "./components/DropDownMenu/DropDownMenu";
import { TileSelector } from "./components/TileSelector/TileSelector";
import JupyterHubHeader from "./components/FooterAndHeader/JupyterHubHeader";
import AnouncmentMessage from "./components/AnouncmentMessage/AnouncmentMessage";
import {
  DropDownButton,
  DropDownOption,
} from "./components/DropDownButton/DropDownButton";
import {
  selectOptionsStorage,
  images,
  sectionTitles,
  formImagesName,
  gpu_instance,
  defaultImagesName,
} from "./data/formData";
import { gatherFormData } from "./scripts/gatherFormData";
import { faCodePullRequest } from "@fortawesome/free-solid-svg-icons";
import {ListObjectsCommand, S3Client} from "@aws-sdk/client-s3";

const StepOne = ({ setFormData, defaultFormData }) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [checkSsh, setCheckSsh] = useState(null);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(null);
  const [activeDropdownOptionIndex, setActiveDropdownOptionIndex] = useState(null);

  useEffect(() => {
    if (defaultFormData && defaultFormData.notebookImage) {

        const text = defaultFormData.notebookImage.type;
        if (text === "customnb") {
          handleInputChange({
            target: {
              value: defaultFormData.notebookImage.selectedOption,
            },
          }, Object.entries(images).length + 1)
        } else if (text === null){
          return
        } else {
          const key = Object.keys(defaultImagesName).find((key) => defaultImagesName[key] === text);
          const dindex = Object.keys(images).indexOf(key);

          const flattenedImages = Object.entries(images).flatMap(([category, options]) =>
            Object.keys(options).map((key) => ({ category, key }))
          );

          const image = defaultFormData.notebookImage.selectedOption.value.replace("cerit.io/hubs/", "");
          const index = flattenedImages.findIndex((entry) => entry.key === image);

          handleSelect(key, image, index, dindex);
        }
        handleSshCheck(defaultFormData.notebookImage.sshAccess);
        setCheckSsh(defaultFormData.notebookImage.sshAccess);
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
        Connection will be available at jovyan@jupyter-{appConfig.userName}{formattedName}.dyn.cloud.e-infra.cz
      </SliderCheckBox>
    </div>
  );
};

const StepTwo = ({ setFormData, formData, defaultFormData, checkedS3Storage, setCheckedS3Storage, handleS3Check, s3SelectionType, setS3SelectionType, s3values}) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [s3activeDropdownIndex, sets3ActiveDropdownIndex] = useState(null);
  const [defaultOptionPhname, setDefaultOptionPhname] = useState(null);
  const [checkedErased, setCheckErased] = useState(false);
  const [checkedDirectories, setCheckedDirectories] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [defaultOptionS3name, setDefaultOptionS3name] = useState(false);

  const [defaultHome, setDefaultHome] = useState(false);
  const [checkedMount, setCheckedMount] = useState(false);


  useEffect(() => {
    if (defaultFormData) {
      if (defaultFormData.persistentHome) {

        const text = defaultFormData.persistentHome.type;
        setFormData((prev) => ({
          ...prev,
          phselection: text,
        }));
        setActiveDropdownIndex(text === "new" ? 0 : 1);
        const check = defaultFormData.persistentHome.eraseIfExists
        if (check) {
          setFormData((prev) => ({
            ...prev,
            phCheck: check,
          }));
          setCheckErased(check)
        }
        const phname = defaultFormData.persistentHome.selectedHome
        if (phname) {
          const name = defaultFormData.persistentHome.selectedHome.value;
          setFormData((prev) => ({
            ...prev,
            phname: name,
          }));
          setDefaultOptionPhname([name, name]);
        }

        const projectDirectories = defaultFormData.projectDirectories

        if (projectDirectories) {
          setFormData((prev) => ({
            ...prev,
            projectCheck: "yes"
          }));

          setCheckedDirectories(projectDirectories)
        }

        const metaCentrumHome = defaultFormData.metaCentrumHome

        if (metaCentrumHome) {

          const enabled = metaCentrumHome.enabled

          if (enabled) {
            setFormData((prev) => ({
              ...prev,
              storageCheck: "yes"
            }));

            setCheckedStorage(enabled)

            const selectedHome = metaCentrumHome.selectedHome.value;

            setFormData((prev) => ({
              ...prev,
              home: selectedHome
            }));

            setDefaultHome([selectedHome, selectedHome])

            const mountToStorage = metaCentrumHome.mountToStorage;

            if(mountToStorage) {
              setFormData((prev) => ({
                ...prev,
                locationStorageCheck: "yes"
              }));

              setCheckedMount(mountToStorage)
            }
          }
        }
      }

      const s3enabled = defaultFormData.s3Storage;

      if (s3enabled) {
        const enabled = s3enabled.enabled
        if (enabled) {
          setFormData((prev) => ({
            ...prev,
            s3check: "yes"
          }));
        }
        setCheckedS3Storage(enabled);

        const s3TypeText = defaultFormData.s3Storage.type;
        setFormData((prev) => ({
          ...prev,
          s3selection: s3TypeText,
        }));
        sets3ActiveDropdownIndex(s3TypeText === "new" ? 1 : 0);
        const existingS3 = defaultFormData.s3Storage.existings3;
        if (existingS3) {
          setS3SelectionType('existing');
          const name = defaultFormData.s3Storage.existings3.value;
          setFormData((prev) => ({
            ...prev,
            s3name: name,
          }));
          setDefaultOptionS3name([name, name]);
        }
        const newS3 = defaultFormData.s3Storage.news3;
        if (newS3) {
          setS3SelectionType('new');
          setS3Url(newS3.s3Url);
          setS3Bucket(newS3.s3Bucket);
          setS3AccessKey(newS3.s3AccessKey);
          setS3SecretKey(newS3.s3SecretKey);
        }
      }
    }
  }, []);

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

  const handleS3NewSelect = (index) => {
    sets3ActiveDropdownIndex(index);
    setS3SelectionType('new');
    setFormData((prev) => ({
      ...prev,
      s3selection: "new",
    }));
  };
  const handleS3Existing = (index) => {
    sets3ActiveDropdownIndex(index);
    setS3SelectionType('existing');
    setFormData((prev) => ({
      ...prev,
      s3selection: "existing",
    }));
  };

  const handleS3Buckets = (val) => {
    setFormData((prev) => ({
      ...prev,
      s3name: val,
    }));
  };

  const setS3Url = (value) => {
    setFormData((prev) => ({
      ...prev,
      s3url: value,
    }));
  };

  const setS3Bucket = (value) => {
    setFormData((prev) => ({
      ...prev,
      s3bucket: value,
    }));
  };

  const setS3AccessKey = (value) => {
    setFormData((prev) => ({
      ...prev,
      s3accesskey: value,
    }));
  };

  const setS3SecretKey = (value) => {
    setFormData((prev) => ({
      ...prev,
      s3secretkey: value,
    }));
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
            id="phCheckId"
            init={checkedErased}
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
            defaultOption={defaultOptionPhname}
          ></DropDownMenu>
        </DropDownButton>
      </FieldHeader>
      <FieldHeader title="MetaCentrum Storage">
        <SliderCheckBox
          title="Mount MetaCentrum storage"
          onChange={handleStorageCheck}
          init={checkedStorage}
        >
          <p>
            Mounted to <code>/home/meta/username </code>{" "}
          </p>
          <DropDownMenu
            formSelect={handleStorage}
            title="Select MetaCentrum Storage"
            menuOptions={selectOptionsStorage}
            defaultOption={defaultHome}
          ></DropDownMenu>
          <SliderCheckBox
            title={`Mount selected home to /storage/${formData["home"] === undefined ? "chosen_storage" : formData["home"]}/home/${appConfig.userName}`}
            onChange={handleLocationStorageCheck}
            init={checkedMount}
          ></SliderCheckBox>
        </SliderCheckBox>

        <SliderCheckBox
          onChange={handleCheckboxDirectories}
          title="Mount project directories"
          init={checkedDirectories}
        >
          <p>
            All projects mounted to /home/projects/brno12, specific projects are
            subfolders of that path
          </p>
        </SliderCheckBox>
      </FieldHeader>
      <FieldHeader
          title="S3 Storage"
      >
        <SliderCheckBox
            title="Mount S3 storage"
            onChange={handleS3Check}
            init={checkedS3Storage}
        >
          <p>
            Mounted to <code>/storage/s3</code>{" "}
          </p>
          {/* EXISTING S3 BUCKET*/}
          <DropDownButton
              key={0}
              isActive={s3activeDropdownIndex === 0}
              onActivate={() => {
                handleS3Existing(0);
              }}
              primary={false}
              title="Existing S3 Bucket"
          >
            <DropDownMenu
                formSelect={handleS3Buckets}
                title="Select S3 Bucket"
                menuOptions={s3values}
                defaultOption={defaultOptionS3name}
            ></DropDownMenu>
          </DropDownButton>

          {/* NEW S3 BUCKET*/}
          <DropDownButton
              key={1}
              isActive={s3activeDropdownIndex === 1}
              onActivate={() => handleS3NewSelect(1)}
              primary={false}
              title="New S3 Bucket"
          >
          </DropDownButton>


          {s3SelectionType === 'new' && (
              <div>
                <div >
                  <span>Enter S3 URL: </span>
                  <input
                      title="S3 URL"
                      type="text"
                      value={formData.s3url}
                      // value = ""https://s3.cloud.e-infra.cz"
                      placeholder="https://s3.cloud.e-infra.cz"
                      onChange={(e) => setS3Url(e.target.value)}
                      className="custom-option"
                      style={{
                        border: '1px solid #ccc', // Solid line border
                        padding: '8px',           // Add padding for better appearance
                        borderRadius: '8px',      // Rounded corners
                      }}
                  />
                </div>
                <div>
                  <span >Enter S3 Bucket Name: </span>
                  <input
                    title="Bucket Name"
                    type="text"
                    value={formData.s3bucket}
                    onChange={(e) => setS3Bucket(e.target.value)}
                    placeholder="example-bucket"
                    className="custom-option"
                    style={{
                      border: '1px solid #ccc', // Solid line border
                      padding: '8px',           // Add padding for better appearance
                      borderRadius: '8px',      // Rounded corners
                    }}
                  />
                </div>
                <div>
                  <span>Enter S3 Access Key: </span>
                  <input
                    title="Access Key"
                    type="text"
                    onChange={(e) => setS3AccessKey(e.target.value)}
                    value={formData.s3accesskey}
                    placeholder="s3AccessKey"
                    className="custom-option"
                    style={{
                      border: '1px solid #ccc', // Solid line border
                      padding: '8px',           // Add padding for better appearance
                      borderRadius: '8px',      // Rounded corners
                    }}
                  />
                </div>
                <div>
                  <span>Enter S3 Secret Key: </span>
                  <input
                    title="Secret Key"
                    type="text"
                    value={formData.s3secretkey}
                    onChange={(e) => setS3SecretKey(e.target.value)}
                    placeholder="s3SecretKey"
                    className="custom-option"
                    style={{
                      border: '1px solid #ccc', // Solid line border
                      padding: '8px',           // Add padding for better appearance
                      borderRadius: '8px',      // Rounded corners
                    }}
                  />
                </div>
              </div>
          )}
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
      {defCPU !== null && defMem !== null && defGPU !== null ? ( <>
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
      </>) : <></>}
    </div>
  );
};

function FormPage() {
  const [checkedS3Storage, setCheckedS3Storage] = useState(false);
  const [s3SelectionType, setS3SelectionType] = useState("");
  const [s3values, setS3Values] = useState({});

  useEffect(() => {
    const s3selectElement = document.getElementById("s3id");
    if (s3selectElement !== null) {
      const options = s3selectElement.getElementsByTagName("option");
      const values = {};
      for (let option of options) {
        values[option.value] = option.value;
      }
      setS3Values(values);
    } else {
      setS3Values({ "testing": "s3testing" });
      // setS3Values({});

    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleS3Check = (checked) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };
      if (checked) {
        updatedFormData.s3check = "yes";
      } else {
        delete updatedFormData.s3check;
        setError('')
      }
      return updatedFormData;
    });
    setCheckedS3Storage(checked);
  };

  const validateS3Credentials = async () => {
    const client = new S3Client({
      endpoint: formData.s3url,
      forcePathStyle: true, // Required for some non-AWS S3 providers to make bucket part of path
      region: "us-east-1", // can be anything but empty ("" not ok)
      credentials: {
        accessKeyId: formData.s3accesskey,
        secretAccessKey: formData.s3secretkey,
      },
    });

    const command = new ListObjectsCommand({
      Bucket: formData.s3bucket,
    });
    try {
      await client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  };

  let defaultFormData = gatherFormData();
  console.log(defaultFormData);
  if (defaultFormData === null) {
    defaultFormData = {
      "memory": {
        "value": "256",
        "text": "256"
      },
      "gpu": {
        "value": "a10",
        "text": "whole A10"
      },
      "cpu": 1,
      "metaCentrumHome": {
        "enabled": true,
        "selectedHome": {
          "value": "du-cesnet",
          "text": "du-cesnet"
        },
        "mountToStorage": false
      },
      "projectDirectories": true,
      "persistentHome": {
        "type": "new",
        "eraseIfExists": false
      },
      "notebookImage": {
        "type": "variousnb",
        "selectedOption": {
          "value": "cerit.io/hubs/colab:2024-10-17",
          "text": "Google Colab"
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
    s3url: "https://s3.cloud.e-infra.cz",
    s3bucket: "",
    s3accesskey: "",
    s3secretkey: "",
  });

  const submitForm = async () => {
    const requiredFields = {
      images: "Image",
      phselection: "Persistent Notebook Home",
      s3url: "S3 URL",
      s3bucket: "S3 bucket",
      s3accesskey: "S3 Access Key",
      s3secretkey: "S3 Secret Key"
    };

    if (checkedS3Storage && !s3SelectionType) {
      setError("Please choose either 'New' or 'Existing' S3 bucket option or deselect S3 choice.");
      return;
    }

    if (checkedS3Storage && s3SelectionType === "existing") {
      if (Object.keys(s3values).length === 0) {
        setError(`No existing S3 bucket was found, please choose option 'New'`);
        return;
      }
      if (!formData.s3name) {
        setError(`Existing S3 bucket was not selected, please choose some`);
        return;
      }

    }

    const filteredRequiredFields = Object.fromEntries(
        Object.entries(requiredFields).filter(([key]) =>
            (key !== 's3url' && key !== 's3bucket' && key !== 's3accesskey' && key !== 's3secretkey')
            || (checkedS3Storage && s3SelectionType === "new")
        )
    );

    const missingFields = Object.keys(filteredRequiredFields)
        .filter((key) => formData[key] === undefined || (key === 's3url' && !formData[key].startsWith('https://')))
        .map((key) => filteredRequiredFields[key]);

    if (missingFields.length > 0) {
      setError(`Please select or fill in the following: ${missingFields.join(", ")}. S3url must be https://`);
      return;
    }

    if (checkedS3Storage && s3SelectionType === "new") {
      const response = await validateS3Credentials();
      if (!response) {
        setError("Invalid S3 credentials/bucket/S3 url - cannot connect to the bucket.\n\nCheck inputs are correct.");
        return;
      }
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
    <StepOne key={0} formData={formData} setFormData={setFormData} defaultFormData={defaultFormData} />,
    <StepTwo key={1} formData={formData} setFormData={setFormData} defaultFormData={defaultFormData}
             checkedS3Storage={checkedS3Storage} setCheckedS3Storage={setCheckedS3Storage} handleS3Check={handleS3Check} s3SelectionType={s3SelectionType}
             setS3SelectionType={setS3SelectionType} s3values={s3values}/>,
    <StepThree key={2} formData={formData} setFormData={setFormData} defaultFormData={defaultFormData} />,
  ];

  return (
    <>
      {/*<AnouncmentMessage style="warning">*/}
      {/*  <ul>*/}
      {/*    <li>*/}
      {/*      On Monday, March 31st, from 8:00 to 20:00, nodes kub-c&#123;1-8&#125; equipped with NVIDIA H100 (94GB) cards will undergo technical maintenance.*/}
      {/*      All notebooks running on these nodes will be restarted and these GPU cards won't be available for allocation.*/}
      {/*    </li>*/}
      {/*  </ul>*/}
      {/*</AnouncmentMessage>*/}
      {/*<AnouncmentMessage style="warning">*/}
      {/*  <h2> Scheduled maintenance and reboot on 16th - 18th Dec 2024 </h2>*/}
      {/*  <p>*/}
      {/*    {" "}*/}
      {/*    We will have scheduled maintenance and cluster reboot between 16th and*/}
      {/*    17th of December 2024. All running notebooks will be interrupted and*/}
      {/*    have to be started again.{" "}*/}
      {/*  </p>*/}
      {/*</AnouncmentMessage>*/}
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
