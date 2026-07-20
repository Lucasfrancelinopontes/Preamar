export default function SelectGroup({
    label,
    name,
    value,
    onChange,
    options,
    optionLabel,
    optionValue,
    colSpan = 1
}) {

    return (

        <div className={colSpan === 2 ? "md:col-span-2" : ""}>

            <label className="block mb-2 text-sm font-semibold text-slate-700">

                {label}

            </label>

            <select

                name={name}
                value={value}
                onChange={onChange}

                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"

            >

                <option value="">

                    Selecione

                </option>

                {options.map((item) => (

                    <option

                        key={item[optionValue]}
                        value={item[optionValue]}

                    >

                        {item[optionLabel]}

                    </option>

                ))}

            </select>

        </div>

    );

}