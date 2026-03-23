import { components, type OptionProps } from "react-select";

import type { SelectOption } from "../../models/option";

import { FaCheck } from "react-icons/fa";

export default function IngredientOption(
  props: OptionProps<SelectOption, false>,
) {
  const { data } = props;
  return (
    <components.Option
      {...props}
      innerRef={props.innerRef}
      innerProps={props.innerProps}
      isDisabled={data.inPantry ? true : false}
    >
      <h1 className="text-black">{data.label}</h1>

      {data.inPantry && <FaCheck className="text-green-600" />}
    </components.Option>
  );
}
