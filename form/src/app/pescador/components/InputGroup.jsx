export default function InputGroup({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    colSpan = 1
}) {

    return (
        <div className={colSpan === 2 ? "md:col-span-2" : ""}>

            <label className="block mb-2 text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-slate-50
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                "
            />

        </div>
    );
}