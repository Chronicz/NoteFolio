"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns" 
import { CalendarIcon, CheckCircle2, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button" // To install these @components  do npx shadcn@latest add <component-name>--> Use --legacy-peer-deps
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar" 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"  
import { DayPicker, DateRange, DayPickerProps, Modifiers, CalendarDay } from "react-day-picker";


// Enum for payment types
const PaymentTypeEnum = {
  CREDIT: "credit",
  DEBIT: "debit",
  PREPAID: "prepaid",
} as const

// Form validation schema
const formSchema = z.object({
  payment_card: z.string().length(16, {
    message: "Card number must be exactly 16 digits",
  }),
  card_user: z
    .string()
    .min(5, {
      message: "Name must be at least 5 characters",
    })
    .max(25, {
      message: "Name must not exceed 25 characters",
    }),
  zip_code: z.string().length(5, {
    message: "ZIP code must be exactly 5 digits",
  }),
  ccv: z
    .string()
    .min(3, {
      message: "CCV must be at least 3 digits",
    })
    .max(4, {
      message: "CCV must not exceed 4 digits",
    }),
  payment_type: z.enum([PaymentTypeEnum.CREDIT, PaymentTypeEnum.DEBIT, PaymentTypeEnum.PREPAID], {
    required_error: "Please select a payment type",
  }),
  expiration_date: z
    .date({
      required_error: "Expiration date is required",
    })
    .refine(
      (date) => {
        // Validate that the date is in the future
        const today = new Date()
        return date > today
      },
      {
        message: "Expiration date must be in the future",
      },
    ),
})

export default function PaymentMethodComponent() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardType, setCardType] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_card: "",
      card_user: "",
      zip_code: "",
      ccv: "",
      payment_type: PaymentTypeEnum.CREDIT,
    },
  })

  const watchCardNumber = form.watch("payment_card")
  const watchCardUser = form.watch("card_user")
  const watchExpDate = form.watch("expiration_date")

  // Detect card type based on first digits
  useEffect(() => {
    if (watchCardNumber) {
      const firstDigit = watchCardNumber.charAt(0)
      const firstTwoDigits = Number.parseInt(watchCardNumber.substring(0, 2))

      if (firstDigit === "4") {
        setCardType("visa")
      } else if (firstTwoDigits >= 51 && firstTwoDigits <= 55) {
        setCardType("mastercard")
      } else if (firstDigit === "3" && (watchCardNumber.charAt(1) === "4" || watchCardNumber.charAt(1) === "7")) {
        setCardType("amex")
      } else if (firstDigit === "6") {
        setCardType("discover")
      } else {
        setCardType("")
      }
    } else {
      setCardType("")
    }
  }, [watchCardNumber])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
    // Here you would typically send the data to your backend
    alert("Payment method saved successfully!")
  }

  // Format card number with spaces for readability
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Format displayed card number with masking
  const formatDisplayCardNumber = (value: string) => {
    if (!value) return "•••• •••• •••• ••••"

    // Show only last 4 digits, mask the rest
    const lastFourDigits = value.slice(-4)
    return `•••• •••• •••• ${lastFourDigits}`
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Card Preview */}
        <div
          className="perspective-1000 w-full max-w-md mx-auto cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full aspect-[16/9] transition-all duration-700 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}
          >
            {/* Front of card */}
            <div className="absolute w-full h-full backface-hidden rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-800 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider opacity-80">Card Type</div>
                  <div className="font-medium">{form.watch("payment_type") || "Credit"}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {cardType === "visa" && <span className="text-white font-bold italic text-lg">VISA</span>}
                  {cardType === "mastercard" && (
                    <div className="relative">
                      <div className="w-5 h-5 rounded-full bg-red-500 absolute left-0"></div>
                      <div className="w-5 h-5 rounded-full bg-yellow-400 absolute left-2 opacity-80"></div>
                    </div>
                  )}
                  {cardType === "amex" && <span className="text-white font-bold text-xs">AMERICAN EXPRESS</span>}
                  {cardType === "discover" && <span className="text-white font-bold text-sm">DISCOVER</span>}
                  {!cardType && <CreditCard className="w-6 h-6 text-white/70" />}
                </div>
              </div>

              <div className="mt-8">
                <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Card Number</div>
                <div className="font-mono text-xl tracking-wider">{formatDisplayCardNumber(watchCardNumber)}</div>
              </div>

              <div className="mt-6 flex justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Card Holder</div>
                  <div className="font-medium uppercase tracking-wide">{watchCardUser || "YOUR NAME"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Expires</div>
                  <div className="font-medium">{watchExpDate ? format(watchExpDate, "MM/yy") : "MM/YY"}</div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 opacity-30">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Back of card */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-violet-700 to-indigo-900 text-white">
              <div className="w-full h-12 bg-black/30 mt-5"></div>
              <div className="px-6 mt-5">
                <div className="flex justify-between items-center">
                  <div className="w-3/4 h-10 bg-white/80 rounded"></div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">CCV</div>
                    <div className="font-mono font-bold tracking-widest">
                      {form.watch("ccv") ? "•".repeat(form.watch("ccv").length) : "•••"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-xs opacity-70 leading-relaxed">
                  This card is property of Your Bank Name. Misuse is criminal offense. If found, please return to Your
                  Bank or to the nearest bank with MasterCard or Visa logo.
                </div>

                <div className="mt-4 text-xs opacity-70">
                  <div>Customer Service: 1-800-123-4567</div>
                  <div>www.yourbank.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment Details</h2>
            <p className="text-gray-500">Complete your purchase securely</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="payment_card"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="1234 5678 9012 3456"
                          className="pl-12 pr-12 py-6 rounded-xl border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 transition-all"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value)
                            e.target.value = formatted.replace(/\s/g, "")
                            field.onChange(e)
                          }}
                          maxLength={16}
                          onFocus={() => {
                            setFocusedField("card_number")
                            setIsFlipped(false)
                          }}
                          onBlur={() => setFocusedField(null)}
                        />
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        {cardType && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {cardType === "visa" && <div className="text-blue-600 font-bold italic">VISA</div>}
                            {cardType === "mastercard" && <div className="text-red-500 font-bold">MC</div>}
                            {cardType === "amex" && <div className="text-blue-500 font-bold">AMEX</div>}
                            {cardType === "discover" && <div className="text-orange-500 font-bold">DISC</div>}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="card_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Cardholder Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="py-6 rounded-xl border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 transition-all"
                        {...field}
                        onFocus={() => {
                          setFocusedField("card_user")
                          setIsFlipped(false)
                        }}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiration_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-700">Expiration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "py-6 rounded-xl border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 transition-all pl-4 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                              onFocus={() => {
                                setFocusedField("expiration_date")
                                setIsFlipped(false)
                              }}
                              onBlur={() => setFocusedField(null)}
                            >
                              {field.value ? format(field.value, "MM/yyyy") : <span>MM/YYYY</span>}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">

                    <Calendar
                      mode="single"
                      selected={field.value as Date | undefined}
                      onSelect={(date: Date | undefined) => {
                        field.onChange(date);
                        setFocusedField(null);
                      }}
                      disabled={(date: Date) => date < new Date()}
                      initialFocus
                      className="p-4"
                      components={{
                        Day: ({
                          day,
                          modifiers,
                          onClick,
                          ...props
                        }: {
                          day: CalendarDay;
                          modifiers: Modifiers;
                        } & React.HTMLAttributes<HTMLDivElement>) => (
                          <div
                            onClick={onClick}
                            {...props}
                            className={cn(
                              "w-10 h-10 flex items-center justify-center rounded-lg",
                              modifiers.selected && "bg-violet-500 text-white",
                              modifiers.disabled && "text-gray-400 cursor-not-allowed",
                              !modifiers.selected && !modifiers.disabled && "hover:bg-gray-100"
                            )}
                          >
                            {day.date.getDate()}
                          </div>
                        ),
                      }}
                    />
                      </PopoverContent>

                      </Popover>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ccv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">CCV</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123"
                          className="py-6 rounded-xl border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 transition-all"
                          {...field}
                          maxLength={4}
                          onFocus={() => {
                            setFocusedField("ccv")
                            setIsFlipped(true)
                          }}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">ZIP Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345"
                          className="py-6 rounded-xl border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 transition-all"
                          {...field}
                          maxLength={5}
                          onFocus={() => {
                            setFocusedField("zip_code")
                            setIsFlipped(true)
                          }}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Payment Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setFocusedField(null)
                        }}
                        defaultValue={field.value}
                        onOpenChange={(open) => {
                          if (open) {
                            setFocusedField("payment_type")
                            setIsFlipped(false)
                          } else {
                            setFocusedField(null)
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="py-6 rounded-xl border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 transition-all">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                          <SelectItem value={PaymentTypeEnum.CREDIT}>Credit</SelectItem>
                          <SelectItem value={PaymentTypeEnum.DEBIT}>Debit</SelectItem>
                          <SelectItem value={PaymentTypeEnum.PREPAID}>Prepaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Save Payment Method
              </Button>
            </form>
          </Form>

          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 12L10.5 14.5L16 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your payment information is securely encrypted
          </div>
        </div>
      </div>
    </div>
  )
}
