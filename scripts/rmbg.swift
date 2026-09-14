import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: rmbg <in> <out.png>"); exit(1) }
let inURL = URL(fileURLWithPath: args[1]); let outURL = URL(fileURLWithPath: args[2])
guard let ci = CIImage(contentsOf: inURL) else { print("cannot load"); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: ci, options: [:])
try handler.perform([req])
guard let res = req.results?.first else { print("no result"); exit(2) }
let maskPB = try res.generateScaledMaskForImage(forInstances: res.allInstances, from: handler)
let mask = CIImage(cvPixelBuffer: maskPB)
let f = CIFilter(name: "CIBlendWithMask")!
f.setValue(ci, forKey: kCIInputImageKey)
f.setValue(CIImage(color: .clear).cropped(to: ci.extent), forKey: kCIInputBackgroundImageKey)
f.setValue(mask, forKey: kCIInputMaskImageKey)
let out = f.outputImage!
let ctx = CIContext()
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
try ctx.writePNGRepresentation(of: out, to: outURL, format: .RGBA8, colorSpace: cs, options: [:])
print("ok", outURL.path)
