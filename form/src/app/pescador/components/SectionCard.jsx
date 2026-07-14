export default function SectionCard({
    title,
    subtitle,
    children
}) {

    return (

        <div className="bg-white rounded-2xl shadow p-8">

            <div className="mb-8">

                <p className="text-sm font-semibold text-blue-600">

                    {subtitle}

                </p>

                <h2 className="text-2xl font-bold text-slate-800 mt-1">

                    {title}

                </h2>

            </div>

            {children}

        </div>

    );

}