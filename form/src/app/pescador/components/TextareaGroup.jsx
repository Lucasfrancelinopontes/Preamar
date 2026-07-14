export default function TextareaGroup({
    label,
    name,
    value,
    onChange,
    rows = 4
}) {

    return (

        <div className="md:col-span-2">

            <label className="block mb-2 text-sm font-semibold text-slate-700">

                {label}

            </label>

            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-slate-50
                    px-4
                    py-3
                    outline-none
                    resize-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                "
            />

        </div>

    );

}