import type { Meta, StoryObj } from "@storybook/react";
import {
  Stepper,
  StepperContent,
  StepperFooter,
  StepperHeader,
} from "./stepper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Define the steps for the stepper
const steps = [
  { label: "Publication Info", description: "Enter publication details" },
  { label: "Duplicity Check", description: "Check for duplicates" },
  { label: "Authors", description: "Add authors" },
  { label: "Acknowledgements", description: "Add acknowledgements" },
];

const StepOne = ({ setFormData, defaultFormData }) => {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [checkSsh, setCheckSsh] = useState(null);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(null);
  const [activeDropdownOptionIndex, setActiveDropdownOptionIndex] =
    useState(null);
  const [customImageValue, setCustomImageValue] = useState(""); // New state for input field value

  useEffect(() => {
    if (defaultFormData && defaultFormData.notebookImage) {
      const text = defaultFormData.notebookImage.type;
      if (text === "customnb") {
        setCustomImageValue(defaultFormData.notebookImage.selectedOption); // Set initial value for input
        setActiveDropdownOptionIndex(null);
        setSelectedDropdownIndex(Object.entries(images).length + 1);
        setFormData((prev) => ({
          ...prev,
          images: "custom",
          customimage: defaultFormData.notebookImage.selectedOption,
        }));
      } else if (text === null) {
        return;
      } else {
        const key = Object.keys(defaultImagesName).find(
          (key) => defaultImagesName[key] === text,
        );

        const dindex = Object.keys(images).indexOf(key);

        const flattenedImages = Object.entries(images).flatMap(
          ([category, options]) =>
            Object.keys(options).map((key) => ({ category, key })),
        );

        const image =
          defaultFormData.notebookImage.selectedOption.value.replace(
            "cerit.io/hubs/",
            "",
          );

        const index = flattenedImages.findIndex((entry) => entry.key === image);
        console.log("index:", index);

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
    setCustomImageValue(e.target.value); // Update state on input change
    setActiveDropdownOptionIndex(null);
    setSelectedDropdownIndex(index);

    setFormData((prev) => ({
      ...prev,
      images: "custom",
      customimage: e.target.value, // Use the current input value
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

  // const extractedName = extractName(appConfig.postUrl);
  // const formattedName = extractedName ? `--${extractedName}` : "";
  const formattedName = defaultFormData.sshName;

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
          value={customImageValue} // Bind input to state
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
        <div>Connection will be available at {formattedName}</div>
        <div style={{ fontSize: "12px" }}>
          In the notebooks, the name is stored as environment variable
          SSH_ADDRESS
        </div>
      </SliderCheckBox>
    </div>
  );
};

function Step2DuplicityCheck() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Duplicity Check</CardTitle>
        <CardDescription>
          Check if this publication already exists in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Checking for duplicate publications...
          </p>
          <p className="text-sm text-green-600 mt-4">No duplicates found!</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Step3Authors() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authors</CardTitle>
        <CardDescription>Add authors to this publication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="author-name">Author Name</Label>
          <Input id="author-name" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author-email">Author Email</Label>
          <Input
            id="author-email"
            type="email"
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author-affiliation">Affiliation</Label>
          <Input id="author-affiliation" placeholder="University Name" />
        </div>
      </CardContent>
    </Card>
  );
}

function Step4Acknowledgements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acknowledgements</CardTitle>
        <CardDescription>
          Add acknowledgements and funding information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="acknowledgements">Acknowledgements</Label>
          <Textarea
            id="acknowledgements"
            placeholder="Enter acknowledgements"
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="funding">Funding Information</Label>
          <Textarea
            id="funding"
            placeholder="Enter funding information"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export const Default: Story = {
  render: () => (
    <div className="w-[800px]">
      <Stepper>
        <StepperHeader steps={steps} />
        <StepperContent>
          <Step1PublicationInfo />
          <Step2DuplicityCheck />
          <Step3Authors />
          <Step4Acknowledgements />
        </StepperContent>
        <StepperFooter onFinish={() => alert("Finished!")} />
      </Stepper>
    </div>
  ),
};

export const WithInitialStep: Story = {
  render: () => (
    <div className="w-[800px]">
      <Stepper initialStep={2}>
        <StepperHeader steps={steps} />
        <StepperContent>
          <Step1PublicationInfo />
          <Step2DuplicityCheck />
          <Step3Authors />
          <Step4Acknowledgements />
        </StepperContent>
        <StepperFooter onFinish={() => alert("Finished!")} />
      </Stepper>
    </div>
  ),
};

export const WithCustomFooter: Story = {
  render: () => (
    <div className="w-[800px]">
      <Stepper>
        <StepperHeader steps={steps} />
        <StepperContent>
          <Step1PublicationInfo />
          <Step2DuplicityCheck />
          <Step3Authors />
          <Step4Acknowledgements />
        </StepperContent>
        <StepperFooter showDefaultButtons={false}>
          <div className="text-sm text-muted-foreground">
            Custom footer content goes here
          </div>
        </StepperFooter>
      </Stepper>
    </div>
  ),
};

export const OnStepChange: Story = {
  render: () => (
    <div className="w-[800px]">
      <Stepper onStepChange={(step) => console.log(`Step changed to: ${step}`)}>
        <StepperHeader steps={steps} />
        <StepperContent>
          <Step1PublicationInfo />
          <Step2DuplicityCheck />
          <Step3Authors />
          <Step4Acknowledgements />
        </StepperContent>
        <StepperFooter onFinish={() => alert("Finished!")} />
      </Stepper>
    </div>
  ),
};
