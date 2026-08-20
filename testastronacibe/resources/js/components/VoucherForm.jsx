import { useState } from 'react';

const AIRCRAFT_TYPES = ['ATR', 'Airbus 320', 'Boeing 737 Max'];

const INITIAL_FORM = {
    name: '',
    id: '',
    flightNumber: '',
    date: '',
    aircraft: AIRCRAFT_TYPES[0],
};

class ApiError extends Error {
    constructor(status, body) {
        super(body?.message ?? 'Request failed.');
        this.status = status;
        this.errors = body?.errors ?? {};
    }
}

async function postJson(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, body);
    }

    return body;
}

export default function VoucherForm() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const [result, setResult] = useState(null);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setFieldErrors({});
        setFormError(null);
        setResult(null);

        try {
            const { exists } = await postJson('/api/check', {
                flightNumber: form.flightNumber,
                date: form.date,
            });

            if (exists) {
                setFormError('Vouchers have already been generated for this flight and date.');
                return;
            }

            const generated = await postJson('/api/generate', form);
            setResult(generated.seats);
        } catch (error) {
            if (error instanceof ApiError) {
                setFieldErrors(error.errors);
                setFormError(error.message);
            } else {
                setFormError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h1 className="text-lg font-semibold text-gray-900 mb-1">Voucher Seat Assignment</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Enter flight and crew details to generate 3 random seat vouchers.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field label="Crew Name" error={fieldErrors.name}>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className={inputClass(fieldErrors.name)}
                        />
                    </Field>

                    <Field label="Crew ID" error={fieldErrors.id}>
                        <input
                            type="text"
                            name="id"
                            value={form.id}
                            onChange={handleChange}
                            required
                            className={inputClass(fieldErrors.id)}
                        />
                    </Field>

                    <Field label="Flight Number" error={fieldErrors.flightNumber}>
                        <input
                            type="text"
                            name="flightNumber"
                            value={form.flightNumber}
                            onChange={handleChange}
                            placeholder="e.g. GA102"
                            required
                            className={inputClass(fieldErrors.flightNumber)}
                        />
                    </Field>

                    <Field label="Flight Date" error={fieldErrors.date}>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                            className={inputClass(fieldErrors.date)}
                        />
                    </Field>

                    <Field label="Aircraft Type" error={fieldErrors.aircraft}>
                        <select
                            name="aircraft"
                            value={form.aircraft}
                            onChange={handleChange}
                            className={inputClass(fieldErrors.aircraft)}
                        >
                            {AIRCRAFT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-md bg-gray-900 text-white py-2 text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? 'Generating…' : 'Generate Vouchers'}
                    </button>
                </form>

                {formError && (
                    <p className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                        {formError}
                    </p>
                )}

                {result && (
                    <div className="mt-4 rounded-md bg-green-50 border border-green-200 px-3 py-3">
                        <p className="text-sm text-green-800 font-medium mb-2">Vouchers generated!</p>
                        <div className="flex gap-2">
                            {result.map((seat) => (
                                <span
                                    key={seat}
                                    className="inline-flex items-center justify-center rounded-md bg-white border border-green-300 text-green-800 font-semibold text-sm px-3 py-1"
                                >
                                    {seat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {children}
            {error && <span className="text-xs text-red-600">{error[0] ?? error}</span>}
        </label>
    );
}

function inputClass(error) {
    return [
        'rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300',
        error ? 'border-red-400' : 'border-gray-300',
    ].join(' ');
}
