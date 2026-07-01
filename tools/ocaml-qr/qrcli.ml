open Qrcode
open Cmdliner

(** Render QR matrix as ASCII with block chars *)
let render_ascii qr =
  let m = Qrcode.matrix qr in
  let dim = Array.length m in
  let buf = Buffer.create (dim * (dim + 1)) in
  Buffer.add_string buf "┌";
  for _ = 1 to dim do Buffer.add_string buf "──" done;
  Buffer.add_string buf "┐\n";
  for y = 0 to dim - 1 do
    Buffer.add_char buf '│';
    for x = 0 to dim - 1 do
      if m.(y).(x) then Buffer.add_string buf "██"
      else Buffer.add_string buf "  "
    done;
    Buffer.add_string buf "│\n"
  done;
  Buffer.add_string buf "└";
  for _ = 1 to dim do Buffer.add_string buf "──" done;
  Buffer.add_string buf "┘\n";
  Buffer.contents buf

(** Generate QR from string *)
let gen_qr data =
  match Qrcode.encode ~version:`Auto ~ecl:`Q data with
  | Ok qr -> qr
  | Error e -> failwith (Qrcode.string_of_error e)

(** CLI: print QR code for given URL *)
let run_url url =
  let qr = gen_qr url in
  print_string (render_ascii qr);
  0

(** CLI: save QR as PNG *)
let run_save url path =
  let qr = gen_qr url in
  let dim = Qrcode.matrix qr |> Array.length in
  let img = Qrcode.to_png ~margin:2 ~scale:10 qr in
  let oc = open_out_bin path in
  output_string oc img;
  close_out oc;
  Printf.printf "QR saved → %s (%dx%d)\n" path dim dim;
  0

(* ── CLI definition ── *)

let url_arg =
  let doc = "URL or text to encode" in
  Arg.(required & pos 0 (some string) None & info [] ~doc)

let output_arg =
  let doc = "Save as PNG file (default: print ASCII to terminal)" in
  Arg.(value & opt (some string) None & info ["o"; "output"] ~doc)

let verbose_arg =
  let doc = "Show QR version info" in
  Arg.(value & flag & info ["v"; "verbose"] ~doc)

let cmd =
  let term = Term.(const run_url $ url_arg) in
  let info =
    Cmd.info "qrcli" ~version:"0.1" ~doc:"QR code generator in OCaml"
  in
  Cmd.v info term

let () = exit (Cmd.eval cmd)
