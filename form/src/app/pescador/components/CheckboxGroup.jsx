export default function CheckboxGroup({

    label,
    checked,
    onChange

}) {

    return (

        <label className="flex items-center gap-3">

            <input

                type="checkbox"

                checked={checked}

                onChange={onChange}

                className="h-5 w-5 rounded border-slate-300 text-blue-600"

            />

            <span className="text-slate-700">

                {label}

            </span>

        </label>

    );

}