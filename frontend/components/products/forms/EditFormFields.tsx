import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/types/products/forms";

interface EditFormFieldsProps {
  form: {
    name: string;
    description: string;
    price: string;
    availability: boolean;
    start_date: string;
    end_date: string;
    category: string;
    condition: string;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSwitchChange: (checked: boolean) => void;
  onSelectChange: (field: string, value: string) => void;
}

export function EditFormFields({
  form,
  onInputChange,
  onSwitchChange,
  onSelectChange,
}: EditFormFieldsProps) {
  return (
    <>
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-jet">
          Product Name *
        </Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={onInputChange}
          required
          placeholder="Enter product name"
          className="border-taupe focus:border-jet"
        />
      </div>

      {/* Category and Condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-jet">
            Category *
          </Label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={(e) => onSelectChange("category", e.target.value)}
            required
            className="border border-taupe focus:border-jet rounded px-3 py-2 w-full bg-white"
          >
            <option value="" disabled>
              Select category
            </option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-sm font-medium text-jet">
            Condition *
          </Label>
          <select
            id="condition"
            name="condition"
            value={form.condition}
            onChange={(e) => onSelectChange("condition", e.target.value)}
            required
            className="border border-taupe focus:border-jet rounded px-3 py-2 w-full bg-white"
          >
            <option value="" disabled>
              Select condition
            </option>
            {PRODUCT_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-jet">
          Description *
        </Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={onInputChange}
          required
          placeholder="Describe your product..."
          rows={4}
          className="border-taupe focus:border-jet"
        />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-sm font-medium text-jet">
          Price per day (₹) *
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={form.price}
          onChange={onInputChange}
          required
          min="0"
          step="0.01"
          placeholder="0.00"
          className="border-taupe focus:border-jet"
        />
      </div>

      {/* Availability Switch */}
      <div className="flex items-center space-x-2">
        <Switch
          id="availability"
          checked={form.availability}
          onCheckedChange={onSwitchChange}
        />
        <Label htmlFor="availability" className="text-sm font-medium text-jet">
          Available for rent
        </Label>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date" className="text-sm font-medium text-jet">
            Available from
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={onInputChange}
            className="border-taupe focus:border-jet"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date" className="text-sm font-medium text-jet">
            Available until
          </Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={onInputChange}
            className="border-taupe focus:border-jet"
          />
        </div>
      </div>
    </>
  );
}
