import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PeixariaClient from "./PeixariaClient";
import api from "@/services/api";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

jest.mock("@/components/ProtectedRoute", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    getMunicipios: jest.fn(),
    verificarCodigoPeixaria: jest.fn(),
    criarPeixaria: jest.fn(),
    editarPeixaria: jest.fn(),
    buscarPeixaria: jest.fn(),
    excluirPeixaria: jest.fn(),
  },
}));

async function fillVisibleFields(container, user) {
  const controls = Array.from(container.querySelectorAll("input, select, textarea"));
  const selectedRadioGroups = new Set();

  for (const control of controls) {
    if (control.disabled || control.readOnly) continue;

    const tag = control.tagName.toLowerCase();
    const type = (control.getAttribute("type") || "").toLowerCase();

    if (type === "hidden" || type === "button" || type === "submit") continue;

    if (tag === "select") {
      const options = Array.from(control.options || []).filter((option) => option.value !== "");
      if (options.length > 0) {
        await user.selectOptions(control, options[0].value);
      }
      continue;
    }

    if (type === "radio") {
      const groupName = control.getAttribute("name") || "";
      if (groupName && selectedRadioGroups.has(groupName)) {
        continue;
      }
      if (!control.checked) {
        await user.click(control);
      }
      if (groupName) {
        selectedRadioGroups.add(groupName);
      }
      continue;
    }

    if (type === "checkbox") {
      if (!control.checked) {
        await user.click(control);
      }
      continue;
    }

    if (type === "date") {
      fireEvent.change(control, { target: { value: "2026-07-25" } });
      continue;
    }

    const value = type === "number" ? "1" : `${control.name || "campo"} preenchido`;
    fireEvent.change(control, { target: { value } });
  }
}

describe("PeixariaClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.scrollTo = jest.fn();

    api.getMunicipios.mockResolvedValue([
      {
        ID_municipio: 1,
        municipio: "João Pessoa",
        municipioCode: "JP",
        localidades: [
          {
            localidade: "Tambaú",
            localidadeCode: "TB",
          },
        ],
      },
    ]);

    api.verificarCodigoPeixaria.mockResolvedValue({ existe: false });
    api.criarPeixaria.mockResolvedValue({ success: true });
  });

  it("preenche todas as etapas visíveis e envia o cadastro", async () => {
    const user = userEvent.setup();
    const { container } = render(<PeixariaClient />);

    await waitFor(() => expect(api.getMunicipios).toHaveBeenCalled());

    await fillVisibleFields(container, user);

    const municipio = container.querySelector('select[name="municipio"]');
    const localidade = container.querySelector('select[name="localidade"]');

    await user.selectOptions(municipio, "João Pessoa");
    await waitFor(() => {
      const options = Array.from(localidade.options || []).map((option) => option.value);
      expect(options).toContain("Tambaú");
    });
    await user.selectOptions(localidade, "Tambaú");

    for (let idx = 0; idx < 6; idx += 1) {
      await fillVisibleFields(container, user);
      await user.click(screen.getByRole("button", { name: /Próximo Passo/i }));
    }

    await fillVisibleFields(container, user);
    await user.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() => expect(api.criarPeixaria).toHaveBeenCalledTimes(1));

    const payload = api.criarPeixaria.mock.calls[0][0];
    expect(payload).toBeDefined();
    expect(payload.cod_peixaria).toBe("JP TB 25 07 26 01");
    expect(payload.tipo_estabelecimento).toBe("PEIXARIA");
    expect(payload.municipio).toBe("João Pessoa");
    expect(payload.localidade).toBe("Tambaú");

    expect(api.verificarCodigoPeixaria).toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });
});
